using System;
using System.Collections.Generic;
using LunarLabs.Parser;
using Phantasma.Cryptography;
using Phantasma.Core.Types;
using Phantasma.VM.Utils;
using Phantasma.Domain;
using Phantasma.Numerics;
using Phantasma.SDK;
using Phantom.Wallet.Controllers;
using Phantom.Wallet.Helpers;
using Phantom.Wallet.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Phantom.Wallet
{
    public class PhantomConnector 
    {

        public struct Error : IAPIResult
        {
            public string message;
        }
        
        public struct Authorization : IAPIResult
        {
            public string wallet;
            public string dapp;
            public string token;
        }
        
        public struct Balance : IAPIResult
        {
            public string symbol;
            public string value;
            public int decimals;
        }
        
        public struct File: IAPIResult
        {
            public string name;
            public int size;
            public uint date;
            public string hash;
        }
        
        public struct Account : IAPIResult
        {
            public string id;
            public string address;
            public string name;
            public string avatar;
            public Balance[] balances;
            public File[] files;
        }
        
        public struct Invocation : IAPIResult
        {
            public string result;
        }
        
        public struct Transaction : IAPIResult
        {
            public string bytes;
        }

        private Random rnd = new Random();

        private readonly PhantasmaAPI api;
        private PhantasmaKeys keys;

        private WalletStatus Status => WalletStatus.Ready;
        private PhantasmaKeys Keys => keys;
        private string Name => "PhantomLink";
        private Dictionary<string, string> authTokens = new Dictionary<string, string>();
        private AccountController accountController;

        public PhantomConnector(PhantasmaKeys kp)
        {
            this.accountController = new AccountController();
            this.keys = kp;
            Console.WriteLine("Wallet address: " + keys.Address);
        }

        public void Execute(JObject json, Action<int, DataNode, bool> callback)
        {
            var requestType = json.GetValue("request").ToString();

            DataNode root = null;
            int id;
            bool success = false;

            if (!int.TryParse(json.GetValue("id").ToString(), out id))
            {
                root = APIUtils.FromAPIResult(new Error() { message = $"Id is not a number!" });
                callback(id, root, false);
                return;
            }


            if (requestType != "authorize")
            {
                var status = this.Status;
                if (status != WalletStatus.Ready)
                {
                    root = APIUtils.FromAPIResult(new Error() { message = $"wallet is {status}" });
                    callback(id, root, false);
                    return;
                }
            }

            switch (requestType)
            {
                case "authorize":
                {
                    var dapp = json.GetValue("dapp").ToString();
                    if (!string.IsNullOrEmpty(dapp))
                    {
                    string token;
            
                    if (authTokens.ContainsKey(dapp))
                    {
                        token = authTokens[dapp];
                    }
                    else
                    {
                        var bytes = new byte[32];
                        rnd.NextBytes(bytes);
                        token = Base16.Encode(bytes);
                        authTokens[dapp] = token;
                    }
            
                        success = true;
                        root = APIUtils.FromAPIResult(new Authorization() { wallet = this.Name, dapp = dapp, token = token });
                    }
                    else
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = "Invalid amount of arguments" });
                        callback(id, root, success);
                    }
            
                    break;
                }

                case "marketbuycustom":
                {

                    var chain = json.GetValue("chain").ToString();
                    var contract = json.GetValue("contract").ToString();
                    var method = json.GetValue("method").ToString();
                    var param = json.GetValue("params").ToString();
                    var feeamount = json.GetValue("feeamount").ToString();
                    var feesymbol = json.GetValue("feesymbol").ToString();

                    List<object> paramList = SendUtils.BuildParamList(param);

                    var result = accountController.MarketBuyCustom(
                                    keys, chain, contract, method, paramList.ToArray(), feeamount, feesymbol
                                ).Result;

                    if (result.GetType() == typeof(ErrorRes))
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = result.ToString()});
                        callback(id, root, success);
                    }

                    if (result != null)
                    {
                        success = true;
                        root = APIUtils.FromAPIResult(new Invocation() { result = result.ToString()});
                    }
                    else
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = "Invalid amount of arguments" });
                        callback(id, root, success);
                    }
            
                    break;
                }

                case "confirmsellnft":
                {

                    var chain = json.GetValue("chain").ToString();
                    var contract = json.GetValue("contract").ToString();
                    var method = json.GetValue("method").ToString();
                    var param = json.GetValue("params").ToString();
                    var nftId = json.GetValue("id").ToString();

                    List<object> paramList = SendUtils.BuildParamList(param);

                    var result = accountController.ConfirmSellNFT(keys, chain, contract, method, paramList.ToArray(), nftId).Result;

                    if (result.GetType() == typeof(ErrorRes))
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = result.ToString()});
                        callback(id, root, success);
                    }

                    if (result != null)
                    {
                        success = true;
                        root = APIUtils.FromAPIResult(new Invocation() { result = result.ToString()});
                    }
                    else
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = "Invalid amount of arguments" });
                    }
            
                    break;
                }

                case "marketbuycustommodal":
                {
                    var chain = json.GetValue("chain").ToString();
                    var contract = json.GetValue("contract").ToString();
                    var method = json.GetValue("method").ToString();
                    var param = json.GetValue("params").ToString();
                    var nftId = json.GetValue("id").ToString();
                    var quotesymbol = json.GetValue("quoteSymbol").ToString();
                    var pricenft = json.GetValue("priceNFT").ToString();
                    var creatoraddress = json.GetValue("creatorAddress").ToString();

                    List<object> paramList = SendUtils.BuildParamList(param);

                    var result = accountController.MarketBuyCustomModal(
                                    keys, chain, contract, method, paramList.ToArray(), nftId, quotesymbol, pricenft, creatoraddress
                                ).Result;

                    if (result.GetType() == typeof(ErrorRes))
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = result.ToString()});
                        callback(id, root, success);
                    }

                    if (result != null)
                    {
                        success = true;
                        root = APIUtils.FromAPIResult(new Invocation() { result = result.ToString()});
                    }
                    else
                    {
                        root = APIUtils.FromAPIResult(new Error() { message = "Invalid amount of arguments" });
                    }
            
                    break;
                }

                default:
                    root = APIUtils.FromAPIResult(new Error() { message = "Invalid request type" });
                    break;

            }

            callback(id, root, success);

        }

        protected Account GetAccount()
        {
            return new Account() {};
        }
    }
}
