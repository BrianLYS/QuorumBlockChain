package com.jpmorgan.cakeshop.db;

import com.jpmorgan.cakeshop.repo.BlockRepository;
import com.jpmorgan.cakeshop.repo.ContractRepository;
import com.jpmorgan.cakeshop.repo.EventRepository;
import com.jpmorgan.cakeshop.repo.TransactionRepository;
import com.jpmorgan.cakeshop.error.APIException;
import com.jpmorgan.cakeshop.model.Block;
import com.jpmorgan.cakeshop.service.BlockService;
import com.jpmorgan.cakeshop.service.GethHttpService;
import com.jpmorgan.cakeshop.service.NodeService;
import com.jpmorgan.cakeshop.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.math.BigInteger;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;


/**
 * Service which tracks the Blockchain in a local database. As blocks are added
 * to the chain, they are added to our database in near-realtime.
 *
 * @author Chetan Sarva
 *
 */
@Service
@Scope("prototype")
public class BlockScanner extends Thread {

    private static final Logger LOG = LoggerFactory.getLogger(BlockScanner.class);

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private NodeService nodeService;

    @Autowired
    private BlockService blockService;

    @Autowired
    private TransactionService txService;

    @Autowired
    private GethHttpService gethService;

    @Autowired
    private ApplicationContext appContext;

    private Collection<BlockListener> blockListeners;

    private Block previousBlock;

    private Integer previousPeerCount;

    private boolean stopped;
    private Object wakeup;

    public BlockScanner() {
        this.stopped = false;
        this.setName("BlockScanner-" + getId());
    }

    @PostConstruct
    public void init() {
        LOG.debug("starting " + getId());
        this.blockListeners = appContext.getBeansOfType(BlockListener.class).values();
    }

    public void shutdown() {
        LOG.info("Stopping BlockScanner (thread id=" + getId() + ")");
        this.stopped = true;
        synchronized(wakeup) {
            this.wakeup.notify();
        }
        if (this.blockListeners != null && !this.blockListeners.isEmpty()) {
            for (BlockListener blockListener : blockListeners) {
                blockListener.shutdown();
            }

        }
        try {
            this.join();
        } catch (InterruptedException e) {
        }
    }

    /**
     * Lookup the latest block in our DB and fill in missing blocks from the chain
     */
    protected Long backfillBlocks() {

        LOG.info("Catching database up to latest block");
        // get the max block at startup
        Block largestSavedBlock = blockRepository.findTopByOrderByTimestampDesc();
        Block chainBlock = null;
        try {
            chainBlock = blockService.get(null, null, "latest");
        } catch (APIException e) {
            LOG.warn("Failed to read latest block: " + e.getMessage(), e);
            return -1L;
        }

        if (largestSavedBlock == null) {
            fillBlockRange(0, chainBlock.getNumber().longValue());
            return chainBlock.getNumber().longValue();

        } else if (chainBlock.getNumber().longValue() > largestSavedBlock.getNumber().longValue()) {
            fillBlockRange(largestSavedBlock.getNumber().longValue() + 1, chainBlock.getNumber().longValue());
            chainBlock.getNumber().longValue();

        } else if (chainBlock.equals(largestSavedBlock)) {
            previousBlock = chainBlock;
        }
        return -1L;

    }

    private void fillBlockRange(long start, long end) {
        LOG.info("Filling blocks from " + start + " to " + end);

        long step = 99L;

        long i = 0;
        while (true) {
            i = start + step;
            if (i > end) {
                i = end;
            }
            try {
                List<Block> blocks = blockService.get(start, i);
                for (Block block : blocks) {
                    notifyListeners(block);
                    previousBlock = block;
                }

            } catch (APIException e) {
                LOG.warn("Failed to read blocks " + start + "-" + i, e);
            }
            if (i >= end) {
                break;
            }
            start = i+1;
        }
    }

    /**
     * Propagate block to all registered listeners
     * @param block
     */
    private void notifyListeners(Block block) {
        for (BlockListener blockListener : blockListeners) {
            blockListener.blockCreated(block);
        }
    }

    private void handleChainReorg() {
        // flush db
        LOG.info("Flushing DB");
        blockRepository.deleteAll();
        transactionRepository.deleteAll();
        contractRepository.deleteAll();
        eventRepository.deleteAll();

        // fill
        long maxBlock = backfillBlocks();
        long maxDBBlock = 0L;

        while (maxDBBlock < maxBlock) {
            Block latest = blockRepository.findTopByOrderByTimestampDesc();
            maxDBBlock = latest == null ? 0 : latest.getNumber().longValue();
            LOG.debug("Wait to sync up with database");
            try {
                TimeUnit.MILLISECONDS.sleep(100);
            } catch (InterruptedException ex) {
                LOG.info(ex.getMessage());
            }
        }
    }

    private void checkDbSync() throws APIException {
        Block firstChainBlock = blockService.get(null, 1L, null);
        Block firstKnownBlock = blockRepository.findByNumber(new BigInteger("1")).orElse(null);
        if ((firstKnownBlock != null && firstChainBlock.getId() != null && !firstKnownBlock.equals(firstChainBlock))
                || (firstChainBlock.getId() == null && firstKnownBlock != null)) {

            // if block #1 changed, we have a reorg
            LOG.warn("Detected chain reorganization due to new peer connection!");
            handleChainReorg();
            previousBlock = null;
        }
    }

    /**
     * Sleep for the given duration, returns false if interrupted
     *
     * @param seconds
     * @return
     */
    private boolean sleep(int seconds) {
        synchronized(this.wakeup) {
            try {
                TimeUnit.SECONDS.timedWait(this.wakeup, seconds);
            } catch (InterruptedException e) {
                return false;
            }
        }
        return true;
    }

    @Override
    public void run() {

        try {
            this.wakeup = new Object();

            if (!sleep(5)) { // delayed startup
                return;
            }

            // make first request to test connection
            nodeService.get();

            checkDbSync();

            backfillBlocks();

            runLoop();
        } catch (Throwable ex) {
            LOG.error("BlockScanner exception", ex);
        }
    }

    private void runLoop () {
        while (true) {

            if (this.stopped) {
                LOG.debug("Stopping block scanner " + getName());
                return;
            }

            if(!gethService.isConnected()) {
                LOG.debug("Block scanner running but geth is not connected");
                sleep(2);
                continue;
            }

            try {
                Integer latestPeerCount = nodeService.peers().size();
                if (previousPeerCount != null && latestPeerCount > previousPeerCount) {
                    // peer count increased, try to detect chain re-org

                    // 10sec sleep while blocks sync up a bit
                    if (!sleep(10)) {
                        return;
                    }

                    checkDbSync();
                }

                Block latestBlock = blockService.get(null, null, "latest");
                if (previousBlock == null) {
                    previousBlock = blockRepository.findTopByOrderByTimestampDesc();
                }

                if (previousBlock == null || !previousBlock.equals(latestBlock)) {
                    if (previousBlock != null && (latestBlock.getNumber().longValue() - previousBlock.getNumber().longValue()) > 1) {
                        // block that was just polled is ahead of what we have in our DB
                        fillBlockRange(previousBlock.getNumber().longValue() + 1, latestBlock.getNumber().longValue() - 1);
                    }

                    LOG.debug("Saving new block #" + latestBlock.getNumber());
                    notifyListeners(latestBlock);
                    previousBlock = latestBlock;
                }

                previousPeerCount = latestPeerCount;

            } catch (APIException e1) {
                LOG.warn("Error fetching block: " + e1.getMessage());
            }

            if (!sleep(2)) {
                return;
            }
        }
    }



}
