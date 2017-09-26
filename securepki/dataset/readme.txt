    "pdnssec-ba-29-211-894":{ # identifier for each scneario
        "zones-resolved":[ # domains we received a response through Luminati, which means that an exit node's resolver returned A record (IP address) to the exit node, even though we requested a domain with busted record.
            "gowritepaper",
            "past-rrsig-a",
            "mismatch-ds",
            "invalid-rrsig-ksk",
            "missing-rrsig-ksk",
            "missing-ksk",
            "invalid-rrsig-a",
            "future-rrsig-a",
            "missing-rrsig-a"
        ],
        "ex":[ # exit node information
            "cp64836321", # exit node's ID
            "77.77.211.42", # exit node's IP 
            42560, # exit node's AS
            "Telemach d.o.o. Sarajevo",  # exit node's ISP
            "BA" # exit node's country (CCODE)
        ],
        "date":"20170206",  # date we measured 
        "ip-from-sp":"77.77.211.42",  # exit node IP returned from the super proxy 
        "recv_time":{
            "missing-rrsig-a":1486432421.0796239376, # the time that our measurement client received the response 
            "gowritepaper":1486432324.3018159866,
            "missing-ksk":1486432384.5864078999,
            "invalid-rrsig-ksk":1486432356.9211449623,
            "missing-rrsig-ksk":1486432369.0897469521,
            "invalid-rrsig-a":1486432391.1466929913,
            "mismatch-ds":1486432346.31554389,
            "past-rrsig-a":1486432336.1549870968,
            "future-rrsig-a":1486432405.8130528927
        },
        "dns-type":"dnssec", # exit node's resolver type, it could be (1) "google" and (2) "dnssec" where DO bit is enabled
        "zones-requested":{ # zone that we request
            "missing-rrsig-a":{
                "A":[ # Record type that the resolver requested; if it did below informations are appended.
                    [
                        "77.221.0.195", // Resolver IP
                        1, // DNSSEC OK Bit 
                        42560, // Resolver AS
                        "Telemach d.o.o. Sarajevo", // Resolver ISP
                        "BA", // Resolver Country (CCODE)
                        1486432420.6198310852 // Time
                    ]
                ],
                "DNSKEY":[ # This resolver didn't ask a DNSKEY record.

                ],
                "DS":[ # This resolver didn't ask a DS record.

                ]
            },
            "gowritepaper":{
                "A":[
                    [
                        "77.221.0.195",
                        1,
                        42560,
                        "Telemach d.o.o. Sarajevo",
                        "BA",
                        1486432323.5426828861
                    ]
                ],
                "DNSKEY":[   

                ],
                "DS":[

                ]
            },
            "missing-ksk":{
                "A":[
                    [
                        "77.221.0.195",
                        0,
                        42560,
                        "Telemach d.o.o. Sarajevo",
                        "BA",
                        1486432384.1825640202
                    ]
                ],
                "DNSKEY":[

                ],
                "DS":[

                ]
            },
            "invalid-rrsig-ksk":{
                "A":[
                    [
                        "77.221.0.195",
                        0,
                        42560,
                        "Telemach d.o.o. Sarajevo",
                        "BA",
                        1486432356.4391329288
                    ]
                ],
                "DNSKEY":[

                ],
                "DS":[

                ]
            },
            "missing-rrsig-ksk":{
                "A":[
                    [
                        "77.221.0.195",
                        1,
                        42560,
                        "Telemach d.o.o. Sarajevo",
                        "BA",
                        1486432367.9054579735
                    ]
                ],
                "DNSKEY":[

                ],
                "DS":[

                ]
            },
            "mismatch-ds":{
                "A":[
                    [
                        "77.221.0.195",
                        1,
                        42560,
                        "Telemach d.o.o. Sarajevo",
                        "BA",
                        1486432345.2200350761
                    ]
                ],
                "DNSKEY":[

                ],
                "DS":[

                ]
            },
            "past-rrsig-a":{
                "A":[
                    [
                        "77.221.0.195",
                        0,
                        42560,
                        "Telemach d.o.o. Sarajevo",
                        "BA",
                        1486432335.7081611156
                    ]
                ],
                "DNSKEY":[

                ],
                "DS":[

                ]
            }
        },
        "eta":"11202ms",
        "ip-from-webserver":"77.77.211.42",
        "has-error":"missing-zsk",
        "req-country":"ba"
    },

