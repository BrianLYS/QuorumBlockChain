package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func invokeJSONRPC(ctx context.Context, url string, method string, params []interface{}) ([]byte, error) {
	// Create the request body
	requestBody, err := json.Marshal(map[string]interface{}{
		"jsonrpc": "2.0",
		"method":  method,
		"params":  params,
		"id":      1,
	})
	if err != nil {
		return nil, err
	}

	// Create the request
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	// Read the response
	responseBody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	return responseBody, nil
}

func main() {
	// List the accounts
	result, err := invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_accounts", []interface{}{})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the balance of an account
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_getBalance", []interface{}{"0xc9c913c8c3c1cd416d80a0abf475db2062f161f6", "latest"})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the block number
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_blockNumber", []interface{}{})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the block by number
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_getBlockByNumber", []interface{}{"0x1", true})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the block by hash
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_getBlockByHash", []interface{}{"0x0000000000000000000000000000000000000000000000000000000000000000", true})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the transaction by hash
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_getTransactionByHash", []interface{}{"0x0000000000000000000000000000000000000000000000000000000000000000"})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the transaction receipt by hash
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_getTransactionReceipt", []interface{}{"0x0000000000000000000000000000000000000000000000000000000000000000"})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))

	// Get the transaction count of an account
	result, err = invokeJSONRPC(context.Background(), "http://localhost:8545", "eth_getTransactionCount", []interface{}{"0x0000000000000000000000000000000000000000", "latest"})
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(result))
}