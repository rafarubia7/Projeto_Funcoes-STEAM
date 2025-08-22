// Classe principal da calculadora
class QuadraticCalculator {
    constructor() {
        this.initializeElements();
        this.initializeChart();
        this.initializeDecompositionChart();
        this.setupEventListeners();
        this.setupSliderSync();
        this.currentTheme = 'light';
        this.physicsMode = false;
        this.animationFrame = null;
        this.zoomLevel = 1;
        
        // Inicialização com delay para garantir que o DOM está pronto
        setTimeout(() => {
            this.calculate();
            this.updateZoomDisplay();
        }, 100);
    }

    initializeElements() {
        // Parâmetros
        this.paramA = document.getElementById('param-a');
        this.paramB = document.getElementById('param-b');
        this.paramC = document.getElementById('param-c');
        this.sliderA = document.getElementById('slider-a');
        this.sliderB = document.getElementById('slider-b');
        this.sliderC = document.getElementById('slider-c');

        // Controles
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.animateBtn = document.getElementById('animateBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.physicsToggle = document.getElementById('physicsToggle');

        // Personalização
        this.curveColor = document.getElementById('curveColor');
        this.showGrid = document.getElementById('showGrid');
        this.showPoints = document.getElementById('showPoints');
        this.showVertex = document.getElementById('showVertex');
        this.showRoots = document.getElementById('showRoots');
        this.autoScale = document.getElementById('autoScale');

        // Zoom
        this.zoomIn = document.getElementById('zoomIn');
        this.zoomOut = document.getElementById('zoomOut');
        this.resetZoom = document.getElementById('resetZoom');
        this.zoomLevelDisplay = document.getElementById('zoomLevel');

        // Decomposição
        this.showQuadratic = document.getElementById('showQuadratic');
        this.showLinear = document.getElementById('showLinear');
        this.showConstant = document.getElementById('showConstant');
        this.showAll = document.getElementById('showAll');

        // Resultados
        this.discriminantEl = document.getElementById('discriminant');
        this.vertexEl = document.getElementById('vertex');
        this.axisEl = document.getElementById('axis');
        this.rootsEl = document.getElementById('roots');
        this.concavityEl = document.getElementById('concavity');
        this.vertexValueEl = document.getElementById('vertexValue');

        // Elementos de UI
        this.loading = document.getElementById('loading');
        this.toast = document.getElementById('toast');
        this.projectile = document.getElementById('projectile');
    }

    // Atualização na configuração do chart para melhor visualização
    initializeChart() {
        const ctx = document.getElementById('quadraticChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'f(x) = ax² + bx + c',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 8
                }, {
                    label: 'Eixo X (y=0)',
                    data: [],
                    borderColor: 'rgba(0, 0, 0, 0.6)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderWidth: 2,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }, {
                    label: 'Vértice',
                    data: [],
                    borderColor: '#dc2626',
                    backgroundColor: '#dc2626',
                    borderWidth: 3,
                    pointRadius: 10,
                    pointHoverRadius: 14,
                    showLine: false,
                    pointStyle: 'circle'
                }, {
                    label: 'Raízes (cortes no eixo X)',
                    data: [],
                    borderColor: '#059669',
                    backgroundColor: '#059669',
                    borderWidth: 3,
                    pointRadius: 10,
                    pointHoverRadius: 14,
                    showLine: false,
                    pointStyle: 'circle'
                }, {
                    label: 'Interseção Y (0, c)',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b',
                    borderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    showLine: false,
                    pointStyle: 'circle'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            filter: function(item) {
                                // Ocultar datasets vazios da legenda
                                return item.text !== 'Eixo X (y=0)';
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(context) {
                                return `x = ${context[0].parsed.x.toFixed(4)}`;
                            },
                            label: function(context) {
                                const value = context.parsed.y.toFixed(4);
                                if (context.datasetIndex === 1) {
                                    return `Eixo X: y = 0`;
                                } else if (context.datasetIndex === 2) {
                                    return `Vértice: (${context.parsed.x.toFixed(4)}, ${value})`;
                                } else if (context.datasetIndex === 3) {
                                    return `Raiz: x = ${context.parsed.x.toFixed(4)}`;
                                } else if (context.datasetIndex === 4) {
                                    return `Interseção Y: (0, ${value})`;
                                } else {
                                    return `${context.dataset.label}: y = ${value}`;
                                }
                            }
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy',
                            onZoom: (ctx) => {
                                // Sincronizar zoom interno com nosso controle
                                const xRange = ctx.chart.scales.x.max - ctx.chart.scales.x.min;
                                this.zoomLevel = 20 / xRange;
                            }
                        },
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: function(context) {
                                // Destacar o eixo X (x=0)
                                return context.tick.value === 0 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.2)';
                            },
                            lineWidth: function(context) {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        title: {
                            display: true,
                            text: 'x',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            color: 'rgba(0, 0, 0, 0.8)',
                            font: { size: 12 }
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: function(context) {
                                // Destacar o eixo Y (y=0)
                                return context.tick.value === 0 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.2)';
                            },
                            lineWidth: function(context) {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        title: {
                            display: true,
                            text: 'f(x)',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            color: 'rgba(0, 0, 0, 0.8)',
                            font: { size: 12 }
                        }
                    }
                },
                animation: {
                    duration: 600,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Adicionar event listeners para zoom com mouse (mais suave)
        const canvas = this.chart.canvas;
        let zoomTimeout;
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Fazer zoom mais suave
            const factor = e.deltaY > 0 ? 0.95 : 1.05;
            
            // Debounce para evitar muitas atualizações
            clearTimeout(zoomTimeout);
            this.zoom(factor);
            
            zoomTimeout = setTimeout(() => {
                // Atualização final após parar de fazer zoom
                this.updateChart();
            }, 150);
        });

        // Navegação com botão direito do mouse (pan)
        let isPanning = false;
        let lastPanPoint = null;
        let panStartTime = null;

        // Prevenir menu de contexto padrão
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Iniciar pan com botão direito
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Botão direito
                e.preventDefault();
                isPanning = true;
                lastPanPoint = { x: e.clientX, y: e.clientY };
                panStartTime = Date.now();
                
                // Mudar cursor para indicar pan
                canvas.style.cursor = 'grabbing';
                
                // Adicionar classe para indicar estado ativo
                canvas.classList.add('panning');
                this.chart.canvas.parentElement.classList.add('panning');
            }
        });

        // Pan com botão direito
        canvas.addEventListener('mousemove', (e) => {
            if (isPanning && lastPanPoint) {
                e.preventDefault();
                
                const deltaX = e.clientX - lastPanPoint.x;
                const deltaY = e.clientY - lastPanPoint.y;
                
                // Calcular deslocamento em unidades do gráfico
                const xRange = this.chart.options.scales.x.max - this.chart.options.scales.x.min;
                const yRange = this.chart.options.scales.y.max - this.chart.options.scales.y.min;
                
                const canvasRect = canvas.getBoundingClientRect();
                const xStep = xRange / canvasRect.width;
                const yStep = yRange / canvasRect.height;
                
                // Aplicar pan
                this.chart.options.scales.x.min -= deltaX * xStep;
                this.chart.options.scales.x.max -= deltaX * xStep;
                this.chart.options.scales.y.min += deltaY * yStep;
                this.chart.options.scales.y.max += deltaY * yStep;
                
                // Atualizar gráfico
                this.chart.update('none');
                
                // Atualizar último ponto
                lastPanPoint = { x: e.clientX, y: e.clientY };
            }
        });

        // Parar pan
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2 && isPanning) {
                e.preventDefault();
                isPanning = false;
                lastPanPoint = null;
                
                // Restaurar cursor
                canvas.style.cursor = 'default';
                canvas.classList.remove('panning');
                this.chart.canvas.parentElement.classList.remove('panning');
                
                // Verificar se foi um clique rápido (não pan)
                if (panStartTime && Date.now() - panStartTime < 200) {
                    // Clique rápido - resetar zoom para mostrar toda a função
                    this.resetZoomLevel();
                }
                
                panStartTime = null;
            }
        });

        // Parar pan se o mouse sair do canvas
        canvas.addEventListener('mouseleave', () => {
            if (isPanning) {
                isPanning = false;
                lastPanPoint = null;
                canvas.style.cursor = 'default';
                canvas.classList.remove('panning');
                this.chart.canvas.parentElement.classList.remove('panning');
                panStartTime = null;
            }
        });
    }

    initializeDecompositionChart() {
        const ctx = document.getElementById('decompChart').getContext('2d');
        this.decompChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'ax²',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    hidden: true
                }, {
                    label: 'bx',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    hidden: true
                }, {
                    label: 'c',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    hidden: true
                }, {
                    label: 'Total',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    hidden: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center'
                    },
                    y: {
                        type: 'linear',
                        position: 'center'
                    }
                },
                animation: {
                    duration: 800
                }
            }
        });
    }

    setupEventListeners() {
        // Parâmetros
        [this.paramA, this.paramB, this.paramC].forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });

        // Botões principais
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.animateBtn.addEventListener('click', () => this.animateProjectile());

        // Tema e modo física
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.physicsToggle.addEventListener('click', () => this.togglePhysicsMode());

        // Personalização
        this.curveColor.addEventListener('change', () => this.updateChartStyle());
        [this.showGrid, this.showPoints, this.showVertex, this.showRoots, this.autoScale].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateChartStyle());
        });

        // Zoom
        this.zoomIn.addEventListener('click', () => this.zoom(1.2));
        this.zoomOut.addEventListener('click', () => this.zoom(0.8));
        this.resetZoom.addEventListener('click', () => this.resetZoomLevel());

        // Decomposição
        this.showQuadratic.addEventListener('click', () => this.toggleDecomposition(0));
        this.showLinear.addEventListener('click', () => this.toggleDecomposition(1));
        this.showConstant.addEventListener('click', () => this.toggleDecomposition(2));
        this.showAll.addEventListener('click', () => this.showAllDecomposition());
    }

    setupSliderSync() {
        // Sincronizar sliders com inputs
        this.sliderA.addEventListener('input', () => {
            this.paramA.value = this.sliderA.value;
            this.calculate();
        });

        this.sliderB.addEventListener('input', () => {
            this.paramB.value = this.sliderB.value;
            this.calculate();
        });

        this.sliderC.addEventListener('input', () => {
            this.paramC.value = this.sliderC.value;
            this.calculate();
        });

        // Sincronizar inputs com sliders
        this.paramA.addEventListener('input', () => {
            this.sliderA.value = this.paramA.value;
        });

        this.paramB.addEventListener('input', () => {
            this.sliderB.value = this.paramB.value;
        });

        this.paramC.addEventListener('input', () => {
            this.sliderC.value = this.paramC.value;
        });
    }

    getCoefficients() {
        return {
            a: parseFloat(this.paramA.value) || 0,
            b: parseFloat(this.paramB.value) || 0,
            c: parseFloat(this.paramC.value) || 0
        };
    }

    calculateQuadratic(x, a, b, c) {
        return a * x * x + b * x + c;
    }

    calculateVertex(a, b, c) {
        if (a === 0) return null;
        const x = -b / (2 * a);
        const y = this.calculateQuadratic(x, a, b, c);
        return { x, y };
    }

    // Método melhorado para cálculo de raízes com maior precisão
    calculateRoots(a, b, c) {
        // Se a = 0, é uma função linear
        if (Math.abs(a) < 1e-10) {
            if (Math.abs(b) < 1e-10) return []; // Função constante
            const root = -c / b;
            return isFinite(root) ? [root] : [];
        }

        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < -1e-10) {
            return []; // Sem raízes reais
        }
        
        if (Math.abs(discriminant) < 1e-10) {
            // Uma raiz (discriminante ≈ 0)
            const root = -b / (2 * a);
            return isFinite(root) ? [root] : [];
        }
        
        // Duas raízes distintas
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const root1 = (-b + sqrtDiscriminant) / (2 * a);
        const root2 = (-b - sqrtDiscriminant) / (2 * a);
        
        const roots = [root1, root2].filter(root => isFinite(root));
        return roots.sort((a, b) => a - b); // Ordenar as raízes
    }

    calculateDiscriminant(a, b, c) {
        return b * b - 4 * a * c;
    }

    generateChartData() {
        const { a, b, c } = this.getCoefficients();
        
        // Range baseado no zoom com limites de segurança
        let baseRange = 20;
        
        // Verificar se precisamos de um range maior baseado nas raízes
        const roots = this.calculateRoots(a, b, c);
        if (roots.length >= 2) {
            const minRoot = Math.min(...roots);
            const maxRoot = Math.max(...roots);
            const rootSpread = Math.abs(maxRoot - minRoot);
            // Garantir que o range seja pelo menos 2x maior que a distância entre as raízes
            const minRequiredRange = Math.max(20, rootSpread * 2.5);
            baseRange = Math.max(baseRange, minRequiredRange);
        }
        
        const range = Math.max(2, Math.min(100, baseRange / this.zoomLevel));
        
        // Calcular step adaptativo baseado no zoom
        let stepCount = 400; // Aumentado para mais precisão
        if (this.zoomLevel > 4) stepCount = 600; // Mais pontos para zoom alto
        if (this.zoomLevel < 0.5) stepCount = 300; // Menos pontos para zoom baixo
        
        const step = range / stepCount;
        const data = [];

        // Range expandido com limites de segurança
        const extendedRange = Math.min(200, range * 1.5); // Aumentado para 1.5

        for (let x = -extendedRange/2; x <= extendedRange/2; x += step) {
            const y = this.calculateQuadratic(x, a, b, c);
            
            // Filtros de segurança mais rigorosos
            if (isFinite(y) && Math.abs(y) < 100000 && !isNaN(y)) {
                data.push({ 
                    x: parseFloat(x.toFixed(6)), 
                    y: parseFloat(y.toFixed(6)) 
                });
            }
        }

        // Verificar se temos dados suficientes
        if (data.length < 10) {
            // Fallback para casos extremos
            const fallbackRange = 20;
            const fallbackStep = fallbackRange / 200; // Mais pontos no fallback
            data.length = 0;
            
            for (let x = -fallbackRange/2; x <= fallbackRange/2; x += fallbackStep) {
                const y = this.calculateQuadratic(x, a, b, c);
                if (isFinite(y) && Math.abs(y) < 1000) {
                    data.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
                }
            }
        }

        return { data, range: extendedRange };
    }

    updateChart() {
        try {
            const { data, range } = this.generateChartData();
            const { a, b, c } = this.getCoefficients();

            // Verificar se temos dados válidos
            if (!data || data.length === 0) {
                this.showToast('Erro: Não foi possível gerar dados do gráfico', 'error');
                return;
            }

            // Atualizar dados principais
            this.chart.data.datasets[0].data = data;
            this.chart.data.datasets[0].borderColor = this.curveColor.value;

            if (this.autoScale && this.autoScale.checked) {
                // Escala automática com validação
                const vertex = this.calculateVertex(a, b, c);
                const roots = this.calculateRoots(a, b, c);
                
                // Calcular range X com limites de segurança
                let xMin = -range/2;
                let xMax = range/2;
                
                // Validar limites X
                xMin = Math.max(-1000, Math.min(-0.1, xMin));
                xMax = Math.min(1000, Math.max(0.1, xMax));
                
                // Ajustar baseado em pontos importantes - PRIORIDADE MÁXIMA para as raízes
                if (roots.length > 0) {
                    const validRoots = roots.filter(root => isFinite(root) && Math.abs(root) < 1000);
                    if (validRoots.length > 0) {
                        const minRoot = Math.min(...validRoots);
                        const maxRoot = Math.max(...validRoots);
                        const rootSpread = maxRoot - minRoot;
                        // Margem maior para garantir que as raízes sejam sempre visíveis
                        const margin = Math.max(rootSpread * 1.0, 2);
                        
                        // Forçar que as raízes estejam sempre visíveis
                        xMin = Math.max(-1000, minRoot - margin);
                        xMax = Math.min(1000, maxRoot + margin);
                    }
                }
                
                if (vertex && isFinite(vertex.x) && isFinite(vertex.y)) {
                    const margin = Math.max(Math.abs(vertex.x) * 0.2, Math.abs(xMax - xMin) * 0.1);
                    xMin = Math.max(-1000, Math.min(xMin, vertex.x - margin));
                    xMax = Math.min(1000, Math.max(xMax, vertex.x + margin));
                }
                
                // Filtrar dados para o range X atual
                const visibleData = data.filter(point => 
                    point.x >= xMin && point.x <= xMax && 
                    isFinite(point.y) && Math.abs(point.y) < 100000
                );
                
                if (visibleData.length > 0) {
                    const yValues = visibleData.map(point => point.y);
                    let yMin = Math.min(...yValues);
                    let yMax = Math.max(...yValues);
                    
                    // Validar e corrigir limites Y
                    if (!isFinite(yMin) || !isFinite(yMax) || yMin === yMax) {
                        yMin = -10;
                        yMax = 10;
                    } else {
                        const yRange = yMax - yMin;
                        const yMargin = Math.max(yRange * 0.15, 1);
                        
                        yMin = Math.max(-10000, yMin - yMargin);
                        yMax = Math.min(10000, yMax + yMargin);
                        
                        // Garantir que o eixo X seja visível quando apropriado
                        if (yMin > 0 && yMax > yRange * 0.5) {
                            yMin = Math.max(-10000, Math.min(yMin, -yRange * 0.1));
                        }
                        if (yMax < 0 && yMin < -yRange * 0.5) {
                            yMax = Math.min(10000, Math.max(yMax, yRange * 0.1));
                        }
                    }
                    
                    this.chart.options.scales.x.min = xMin;
                    this.chart.options.scales.x.max = xMax;
                    this.chart.options.scales.y.min = yMin;
                    this.chart.options.scales.y.max = yMax;
                }
            } else {
                // Escala manual com limites de segurança
                const xRange = Math.max(1, Math.min(100, range/2));
                const yValues = data.map(point => point.y).filter(y => isFinite(y) && Math.abs(y) < 100000);
                
                if (yValues.length > 0) {
                    const yMin = Math.min(...yValues);
                    const yMax = Math.max(...yValues);
                    const yMargin = Math.max((yMax - yMin) * 0.1, 1);
                    
                    this.chart.options.scales.x.min = -xRange;
                    this.chart.options.scales.x.max = xRange;
                    this.chart.options.scales.y.min = Math.max(-10000, yMin - yMargin);
                    this.chart.options.scales.y.max = Math.min(10000, yMax + yMargin);
                }
            }

            // Atualizar pontos de interesse com validação
            this.updateInterestPoints(a, b, c);

            this.chart.update('none');
            
        } catch (error) {
            console.error('Erro ao atualizar gráfico:', error);
            this.showToast('Erro ao atualizar gráfico. Resetando zoom...', 'error');
            this.zoomLevel = 1;
            this.updateZoomDisplay();
        }
    }

    // Método aprimorado para atualizar pontos de interesse
    updateInterestPoints(a, b, c) {
        const xMin = this.chart.options.scales.x.min;
        const xMax = this.chart.options.scales.x.max;
        const yMin = this.chart.options.scales.y.min;
        const yMax = this.chart.options.scales.y.max;

        // Linha do eixo X (y=0) - sempre visível quando y=0 está no range
        if (yMin <= 0 && yMax >= 0) {
            this.chart.data.datasets[1].data = [
                { x: xMin, y: 0 },
                { x: xMax, y: 0 }
            ];
        } else {
            this.chart.data.datasets[1].data = [];
        }

        // Vértice
        const vertex = this.calculateVertex(a, b, c);
        if (vertex && this.showVertex.checked && 
            isFinite(vertex.x) && isFinite(vertex.y) &&
            vertex.x >= xMin && vertex.x <= xMax && 
            vertex.y >= yMin && vertex.y <= yMax) {
            this.chart.data.datasets[2].data = [vertex];
            this.chart.data.datasets[2].hidden = false;
        } else {
            this.chart.data.datasets[2].data = [];
        }

        // Raízes (pontos onde a função corta o eixo X) - VISUALIZAÇÃO MELHORADA
        const roots = this.calculateRoots(a, b, c);
        if (roots.length > 0 && this.showRoots.checked) {
            const visibleRoots = roots.filter(root => 
                isFinite(root) && Math.abs(root) < 10000 &&
                root >= xMin && root <= xMax
            );
            
            this.chart.data.datasets[3].data = visibleRoots.map(root => ({
                x: parseFloat(root.toFixed(6)),
                y: 0
            }));
            this.chart.data.datasets[3].hidden = false;
            
            // DESTACAR MUITO MAIS as raízes para visualização clara
            this.chart.data.datasets[3].pointRadius = 12; // Aumentado para 12
            this.chart.data.datasets[3].pointHoverRadius = 16; // Aumentado para 16
            this.chart.data.datasets[3].borderWidth = 4; // Aumentado para 4
            this.chart.data.datasets[3].backgroundColor = '#dc2626'; // Vermelho vibrante
            this.chart.data.datasets[3].borderColor = '#dc2626';
            
            // Adicionar sombra para destacar ainda mais
            this.chart.data.datasets[3].pointBackgroundColor = '#dc2626';
            this.chart.data.datasets[3].pointBorderColor = '#ffffff';
            this.chart.data.datasets[3].pointBorderWidth = 2;
        } else {
            this.chart.data.datasets[3].data = [];
        }

        // Adicionar ponto de interseção com eixo Y (0, c)
        if (xMin <= 0 && xMax >= 0 && yMin <= c && yMax >= c && this.showPoints && this.showPoints.checked) {
            // Se não existe dataset para interseção Y, criar um
            if (!this.chart.data.datasets[4]) {
                this.chart.data.datasets[4] = {
                    label: 'Interseção Y',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b',
                    borderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    showLine: false,
                    pointStyle: 'circle'
                };
            }
            
            this.chart.data.datasets[4].data = [{
                x: 0,
                y: parseFloat(c.toFixed(6))
            }];
            this.chart.data.datasets[4].hidden = false;
        } else if (this.chart.data.datasets[4]) {
            this.chart.data.datasets[4].data = [];
        }


    }

    updateDecompositionChart() {
        const { a, b, c } = this.getCoefficients();
        const range = 10;
        const step = 0.2;
        const labels = [];
        const quadraticData = [];
        const linearData = [];
        const constantData = [];
        const totalData = [];

        for (let x = -range; x <= range; x += step) {
            labels.push(x.toFixed(1));
            quadraticData.push({ x: x, y: a * x * x });
            linearData.push({ x: x, y: b * x });
            constantData.push({ x: x, y: c });
            totalData.push({ x: x, y: this.calculateQuadratic(x, a, b, c) });
        }

        this.decompChart.data.labels = labels;
        this.decompChart.data.datasets[0].data = quadraticData;
        this.decompChart.data.datasets[1].data = linearData;
        this.decompChart.data.datasets[2].data = constantData;
        this.decompChart.data.datasets[3].data = totalData;

        this.decompChart.update('none');
    }

    updateResults() {
        const { a, b, c } = this.getCoefficients();
        
        // Discriminante
        const discriminant = this.calculateDiscriminant(a, b, c);
        this.discriminantEl.textContent = discriminant.toFixed(3);
        this.discriminantEl.className = 'value';
        if (discriminant > 0) this.discriminantEl.classList.add('positive');
        else if (discriminant < 0) this.discriminantEl.classList.add('negative');

        // Vértice
        const vertex = this.calculateVertex(a, b, c);
        if (vertex) {
            this.vertexEl.textContent = `(${vertex.x.toFixed(3)}, ${vertex.y.toFixed(3)})`;
            this.vertexValueEl.textContent = vertex.y.toFixed(3);
        } else {
            this.vertexEl.textContent = 'N/A';
            this.vertexValueEl.textContent = 'N/A';
        }

        // Eixo de simetria
        if (a !== 0) {
            const axis = -b / (2 * a);
            this.axisEl.textContent = `x = ${axis.toFixed(3)}`;
        } else {
            this.axisEl.textContent = 'N/A';
        }

        // Raízes
        const roots = this.calculateRoots(a, b, c);
        if (roots.length === 0) {
            this.rootsEl.textContent = 'Sem raízes reais';
        } else if (roots.length === 1) {
            this.rootsEl.textContent = `x = ${roots[0].toFixed(3)}`;
        } else {
            this.rootsEl.textContent = `x₁ = ${roots[0].toFixed(3)}, x₂ = ${roots[1].toFixed(3)}`;
        }

        // Concavidade
        if (a > 0) {
            this.concavityEl.textContent = 'Para cima (U)';
            this.concavityEl.className = 'value positive';
        } else if (a < 0) {
            this.concavityEl.textContent = 'Para baixo (∩)';
            this.concavityEl.className = 'value negative';
        } else {
            this.concavityEl.textContent = 'Função linear';
            this.concavityEl.className = 'value';
        }
    }

    updateChartStyle() {
        // Cor da curva
        this.chart.data.datasets[0].borderColor = this.curveColor.value;
        
        // Grade
        this.chart.options.scales.x.grid.display = this.showGrid.checked;
        this.chart.options.scales.y.grid.display = this.showGrid.checked;

        // Pontos de interesse
        this.chart.data.datasets[1].hidden = !this.showVertex.checked;
        this.chart.data.datasets[2].hidden = !this.showRoots.checked;

        this.chart.update('none');
    }

    calculate() {
        this.showLoading();
        
        setTimeout(() => {
            this.updateChart();
            this.updateDecompositionChart();
            this.updateResults();
            this.updateZoomDisplay();
            this.hideLoading();
            this.showToast('Cálculos atualizados!', 'success');
        }, 300);
    }

    reset() {
        this.paramA.value = '1';
        this.paramB.value = '0';
        this.paramC.value = '0';
        this.sliderA.value = '1';
        this.sliderB.value = '0';
        this.sliderC.value = '0';
        this.curveColor.value = '#3b82f6';
        this.zoomLevel = 1;
        
        // Reset checkboxes
        this.showGrid.checked = false;
        this.showPoints.checked = true;
        this.showVertex.checked = true;
        this.showRoots.checked = true;
        this.autoScale.checked = true;

        this.calculate();
        this.showToast('Valores resetados!', 'success');
    }

    zoom(factor) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel *= factor;
        
        // Limites mais conservadores para evitar bugs
        this.zoomLevel = Math.max(0.2, Math.min(8, this.zoomLevel));
        
        // Verificar se o zoom mudou significativamente
        if (Math.abs(this.zoomLevel - oldZoom) > 0.01) {
            this.updateChart();
            this.updateZoomDisplay();
            const percentage = Math.round(this.zoomLevel * 100);
            
            // Avisar quando próximo do limite
            if (this.zoomLevel >= 7.5) {
                this.showToast(`Zoom máximo: ${percentage}%`, 'warning');
            } else if (this.zoomLevel <= 0.25) {
                this.showToast(`Zoom mínimo: ${percentage}%`, 'warning');
            } else {
                this.showToast(`Zoom: ${percentage}%`, 'success');
            }
        }
    }

    resetZoomLevel() {
        this.zoomLevel = 1;
        this.updateChart();
        this.updateZoomDisplay();
        this.showToast('Zoom resetado para 100%!', 'success');
    }

    updateZoomDisplay() {
        if (this.zoomLevelDisplay) {
            const percentage = Math.round(this.zoomLevel * 100);
            this.zoomLevelDisplay.textContent = `${percentage}%`;
            
            // Atualizar classes visuais baseado no nível de zoom
            this.zoomLevelDisplay.classList.remove('warning', 'max-zoom');
            
            if (this.zoomLevel >= 7.5) {
                this.zoomLevelDisplay.classList.add('max-zoom');
            } else if (this.zoomLevel >= 6 || this.zoomLevel <= 0.3) {
                this.zoomLevelDisplay.classList.add('warning');
            }
        }
    }

    toggleDecomposition(index) {
        const dataset = this.decompChart.data.datasets[index];
        dataset.hidden = !dataset.hidden;
        this.decompChart.update();
    }

    showAllDecomposition() {
        this.decompChart.data.datasets.forEach(dataset => {
            dataset.hidden = false;
        });
        this.decompChart.update();
    }

    animateProjectile() {
        const { a, b, c } = this.getCoefficients();
        
        if (a >= 0) {
            this.showToast('Para animação de projétil, o coeficiente "a" deve ser negativo!', 'warning');
            return;
        }

        const roots = this.calculateRoots(a, b, c);
        if (roots.length < 2) {
            this.showToast('Para animação de projétil, a parábola deve ter duas raízes!', 'warning');
            return;
        }

        const startX = Math.min(...roots);
        const endX = Math.max(...roots);
        const vertex = this.calculateVertex(a, b, c);

        if (!vertex || vertex.y <= 0) {
            this.showToast('Para animação de projétil, o vértice deve estar acima do eixo x!', 'warning');
            return;
        }

        this.projectile.classList.add('animating');
        
        const duration = 3000; // 3 segundos
        const startTime = Date.now();
        const chartRect = this.chart.canvas.getBoundingClientRect();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = startX + (endX - startX) * progress;
            const currentY = this.calculateQuadratic(currentX, a, b, c);

            // Converter coordenadas do gráfico para pixels
            const xPixel = this.chart.scales.x.getPixelForValue(currentX);
            const yPixel = this.chart.scales.y.getPixelForValue(currentY);

            this.projectile.style.left = `${xPixel}px`;
            this.projectile.style.top = `${yPixel}px`;

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.projectile.classList.remove('animating');
                this.showToast('Animação concluída!', 'success');
            }
        };

        animate();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        this.showToast(`Tema ${this.currentTheme === 'light' ? 'claro' : 'escuro'} ativado!`, 'success');
    }

    togglePhysicsMode() {
        this.physicsMode = !this.physicsMode;
        document.body.classList.toggle('physics-mode', this.physicsMode);
        this.physicsToggle.classList.toggle('active', this.physicsMode);
        
        this.showToast(`Modo física ${this.physicsMode ? 'ativado' : 'desativado'}!`, 'success');
    }

    showLoading() {
        this.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new QuadraticCalculator();
    
    // Adicionar efeitos de entrada
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    calculator.reset();
                    break;
                case 'Enter':
                    e.preventDefault();
                    calculator.calculate();
                    break;
                case 't':
                    e.preventDefault();
                    calculator.toggleTheme();
                    break;
                case 'p':
                    e.preventDefault();
                    calculator.togglePhysicsMode();
                    break;
            }
        }
    });

    // Adicionar tooltip para atalhos
    const shortcuts = [
        { element: calculator.resetBtn, shortcut: 'Ctrl+R' },
        { element: calculator.calculateBtn, shortcut: 'Ctrl+Enter' },
        { element: calculator.themeToggle, shortcut: 'Ctrl+T' },
        { element: calculator.physicsToggle, shortcut: 'Ctrl+P' }
    ];

    shortcuts.forEach(({ element, shortcut }) => {
        if (element) {
            element.title += ` (${shortcut})`;
        }
    });
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}