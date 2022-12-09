package com.jpmorgan.cakeshop.service;

import com.jpmorgan.cakeshop.error.APIException;
import com.jpmorgan.cakeshop.model.Web3DefaultResponseType;
import org.web3j.protocol.besu.Besu;
import org.web3j.protocol.core.Request;
import org.web3j.quorum.Quorum;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Michael Kazansky
 */
public interface GethHttpService {

    public static final String GETH_API_VERSION = "2.0";
    public static final Long GETH_REQUEST_ID = 42L; // We don't actually use this, so just use a constant

    public Quorum getQuorumService() throws APIException;

    public Besu getBesuService() throws APIException;

    /**
     * Call the given Geth RPC method
     *
     * @param funcName RPC function name
     * @param args Optional args
     *
     * @return
     * @throws APIException
     */
    public Map<String, Object> executeGethCall(String funcName, Object... args) throws APIException;

    /**
     * Process the given request
     *
     * @param request
     * @return
     * @throws APIException
     */
    public Map<String, Object> executeGethCall(Request<?, Web3DefaultResponseType> request) throws APIException;

    public List<Map<String, Object>> batchExecuteGethCall(List<Request<?, Web3DefaultResponseType>> requests) throws APIException;

    public Request<?, Web3DefaultResponseType> createHttpRequestType(String funcName, Object... args) throws APIException;

    /**
     * Returns the current node status
     *
     * @return
     */
    Boolean isConnected();

    void setConnected(boolean running);

    void connectToNode(Long nodeId);

    String getCurrentRpcUrl();

    String getCurrentTransactionManagerUrl();

    BigInteger getBalance(String address) throws APIException;

}
