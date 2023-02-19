package main

import (
	"fmt"
	"net/rpc"
)

type GetBalanceArgs struct {
	Address string
}

type GetBalanceResult struct {
	Balance string
}

func main() {
	client, err := rpc.DialHTTP("tcp", "localhost:8545")
	if err != nil {
		fmt.Println(err)
		return
	}

	args := &GetBalanceArgs{
		Address: "0x0000000000000000000000000000000000000000",
	}
	var result GetBalanceResult
	err = client.Call("eth_getBalance", args, &result)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(result.Balance)
}
