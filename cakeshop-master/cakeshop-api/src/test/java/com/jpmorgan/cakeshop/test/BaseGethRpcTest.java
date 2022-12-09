package com.jpmorgan.cakeshop.test;

import com.google.common.collect.Lists;
import com.jpmorgan.cakeshop.config.AppStartup;
import com.jpmorgan.cakeshop.error.APIException;
import com.jpmorgan.cakeshop.model.NodeInfo;
import com.jpmorgan.cakeshop.model.Transaction;
import com.jpmorgan.cakeshop.model.TransactionResult;
import com.jpmorgan.cakeshop.model.json.WalletPostJsonRequest;
import com.jpmorgan.cakeshop.repo.NodeInfoRepository;
import com.jpmorgan.cakeshop.service.ContractService;
import com.jpmorgan.cakeshop.service.GethHttpService;
import com.jpmorgan.cakeshop.service.TransactionService;
import com.jpmorgan.cakeshop.service.WalletService;
import com.jpmorgan.cakeshop.test.config.TempFileManager;
import com.jpmorgan.cakeshop.test.config.TestAppConfig;
import com.jpmorgan.cakeshop.util.CakeshopUtils;
import com.jpmorgan.cakeshop.util.FileUtils;
import com.jpmorgan.cakeshop.util.ProcessUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;

import javax.sql.DataSource;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

@ActiveProfiles("test")
@ContextConfiguration(classes = {TestAppConfig.class})
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
public abstract class BaseGethRpcTest extends AbstractTestNGSpringContextTests {

    private static final Logger LOG = LoggerFactory.getLogger(BaseGethRpcTest.class);

    static {
        System.setProperty("spring.profiles.active", "test");
    }

    @Value("${nodejs.binary:node}")
    String nodeJsBinaryName;

    @Autowired
    private ContractService contractService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AppStartup appStartup;

    @Autowired
    protected GethHttpService geth;

    @Value("${cakeshop.config.dir}")
    private String CONFIG_ROOT;

    @Autowired
    private NodeInfoRepository nodeInfoRepository;

    @Autowired
    private GethHttpService gethHttpService;

    @Autowired
    private DataSource embeddedDb;

    @Autowired
    private WalletService walletService;

    public BaseGethRpcTest() {
        super();
    }

    @AfterSuite(alwaysRun = true)
    public void stopSolc() throws IOException {
        List<String> args = Lists.newArrayList(
                nodeJsBinaryName,
                CakeshopUtils.getSolcPath(),
                "--stop-ipc");

        ProcessBuilder builder = ProcessUtils.createProcessBuilder(args);
        builder.start();
    }

    @AfterSuite(alwaysRun = true)
    public void cleanupTempPaths() {
        try {
            if (CONFIG_ROOT != null) {
                FileUtils.deleteDirectory(new File(CONFIG_ROOT));
            }
            TempFileManager.cleanupTempPaths();
        } catch (IOException e) {
        }
    }

    @BeforeClass
    public void connectGeth() throws IOException {
            NodeInfo testNode = nodeInfoRepository.findByRpcUrlAndTransactionManagerUrl("http://localhost:22000", "http://localhost:9081").orElse(null);
            if(testNode == null) {
                testNode = new NodeInfo("test", "http://localhost:22000", "http://localhost:9081");
                nodeInfoRepository.save(testNode);
                LOG.debug("Created node Id {}", testNode.id);
            }
            if(!gethHttpService.isConnected()) {
                gethHttpService.connectToNode(testNode.id);
                initializeChain();
            }
    }

    /**
     * Read the given test resource file
     *
     * @param path
     * @return
     * @throws IOException
     */
    protected String readTestFile(String path) throws IOException {
        return FileUtils.readClasspathFile(path);
    }

    /**
     * Deploy SimpleStorage sample to the chain and return its address
     *
     * @return
     * @throws IOException
     * @throws InterruptedException
     */
    protected String createContract() throws IOException, InterruptedException {
        String code = readTestFile("contracts/simplestorage.sol");
        return createContract(code, new Object[]{100}, "simplestorage.sol");
    }

    /**
     * Deploy the given contract code to the chain
     *
     * @param code
     * @param filename
     * @return
     * @throws APIException
     * @throws InterruptedException
     */
    protected String createContract(String code, Object[] args, String filename) throws APIException, InterruptedException {
        TransactionResult result = contractService.create(null, code, ContractService.CodeType.solidity, args, null, null, null,
            filename, true, "byzantium", null);
        assertNotNull(result);
        assertNotNull(result.getId());
        assertTrue(!result.getId().isEmpty());

        Transaction tx = transactionService.waitForTx(result, 50, TimeUnit.MILLISECONDS);

        return tx.getContractAddress();
    }


    void initializeChain() throws APIException {
        walletService.list()
            .forEach(account -> {
            if(account.isUnlocked()) {
                return;
            }
            try {
                WalletPostJsonRequest request = new WalletPostJsonRequest();
                request.setAccount(account.getAddress());
                request.setAccountPassword("");
                walletService.unlockAccount(request);
            } catch (APIException e) {
                e.printStackTrace();
            }
        });
    }
}
