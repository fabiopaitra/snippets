(function () {
    'use strict';

    angular.module('BlurAdmin.pages.charts.amCharts')
        .controller('faturamentoCtrl', faturamentoCtrl);

    function faturamentoCtrl($http, $rootScope, $scope) {


        // var url = cfg.url.back + '/dados_estatistica/dados';
        var url = 'app/resultado.json';

        function reqConfig(url) {
            return {
                "url": url,
                "method": "GET",
                "headers": {
                    "token": sessionStorage.getItem('token')
                }
            };
        }

        function dadosEstatistica() {
            return new Promise(function (devolve) {
                $http(reqConfig(url)).then(function (res) {
                    console.log(res.data);
                    var minuto = 60000;
                    var hora = (60 * minuto);
                    var dia = (hora * 24);
                    var voltaDias = function (dias) {
                        var hoje = new Date();
                        hoje.setDate(hoje.getDate() - dias);
                        return hoje.getFullYear() + '-' + ('0' + (hoje.getMonth() + 1)).substr(-2) + '-' + ('0' + hoje.getDate()).substr(-2);
                    };
                    
                    var acessosAPartirDe = function (data, res) {
                        var retorno = {
                            total: 0,
                            dashs: {}
                        };
                        res.data.acessos.forEach(function (r) {
                            if (!retorno.dashs.hasOwnProperty(r.dash)) retorno.dashs[r.dash] = 0;
                            r.acessos.forEach(function (a) {
                                if (a.quando.substr(0, 10) >= data) {
                                    retorno.dashs[r.dash]++;
                                    retorno.total++;
                                }
                            });
                        });
                        return retorno;
                    };

                    var comAcesso = function (acessos) {
                        var total = 0;
                        Object.keys(acessos.dashs).forEach(function (d) {
                            total += acessos.dashs[d] > 0 ? 1 : 0;
                        });
                        return total;
                    };

                    var semAcesso = function (acessos) {
                        var total = 0;
                        Object.keys(acessos.dashs).forEach(function (d) {
                            total += acessos.dashs[d] === 0 ? 1 : 0;
                        });
                        return total;
                    };

                    var data = voltaDias(5);
                    var acessos = acessosAPartirDe(data, res);

                    var chartDataIndicadores = [{
                        indicador: "Total",
                        quantidade: res.data.dashsNoServidor,
                        open: 0,
                        close: res.data.dashsNoServidor,
                        percentual: '-'
                    }, {
                        indicador: "Internos",
                        quantidade: res.data.dashsInternos,
                        open: res.data.dashsNoServidor,
                        close: (res.data.dashsNoServidor - res.data.dashsInternos),
                        percentual: ((res.data.dashsInternos / res.data.dashsNoServidor) * 100).toFixed(2)
                    }, {
                        indicador: "Operacionais",
                        quantidade: res.data.dashsNoServidor - res.data.dashsInternos,
                        open: 0,
                        close: (res.data.dashsNoServidor - res.data.dashsInternos),
                        percentual: (((res.data.dashsNoServidor - res.data.dashsInternos) / res.data.dashsNoServidor) * 100).toFixed(2)
                    }, {
                        indicador: "Desativados",
                        quantidade: res.data.dashsNoServidor - res.data.dashsAtivos,
                        open: 0,
                        fim: res.data.dashsNoServidor - res.data.dashsAtivos,
                        percentual: (((res.data.dashsNoServidor - res.data.dashsAtivos) / res.data.dashsNoServidor) * 100).toFixed(2)
                    }, {
                        indicador: "Com acesso nos últimos 5 dias",
                        quantidade: comAcesso(acessos),
                        open: 0,
                        close: comAcesso(acessos),
                        percentual: ((comAcesso(acessos) / res.data.dashsNoServidor) * 100).toFixed(2)
                    }, {
                        indicador: "Sem acesso nos últimos 5 dias",
                        quantidade: semAcesso(acessos),
                        open: 0,
                        close: semAcesso(acessos),
                        percentual: ((semAcesso(acessos) / res.data.dashsNoServidor) * 100).toFixed(2)
                    }, {
                        indicador: "Ainda não implementado log",
                        quantidade: "-",
                        inicio: 0,
                        fim: 5,
                        percentual: "-"
                    }];
                    devolve(chartDataIndicadores);
                });
            });
        }

        dadosEstatistica().then(function (data) {
            $rootScope.chart.dataProvider = data;
            console.log($rootScope.chart.dataProvider);
            $rootScope.chart.validateData();
        });

        var chartConfig = {
            type: "serial",
            theme: "light",
            // "addClassNames": true,
            // "decimalSeparator": ".",
            // "thousandsSeparator": ".",
            // "columnWidth": 0.6,
            categoryField: "indicador",
            dataProvider: [],
            valueAxes: [{
                color: "white",
                axisAlpha: 0,
                gridAlpha: 0,
            }],
            graphs: [{
                type: "column",
                valueField: "quantidade",
                openField: "open",
                closeField: "close",
                labelText: "[[value]]",
                fillColors: ["#037366", "#202221"],
                cornerRadiusTop: 5,
                fillAlphas: 0.8,
                lineAlpha: 0,
                balloonText: "[[category]]: <strong> [[value]]<br> [[percentual]]% </strong>",
            }],
            categoryAxis: {
                axisAlpha: 0,
                color: "#202221",
                gridAlpha: 0,
                labelRotation: 30,
            },
            creditsPosition: "bottom-left",
        };

        var id = 'faturamento';
        $rootScope.chart = AmCharts.makeChart(id, chartConfig);
    }

})();
