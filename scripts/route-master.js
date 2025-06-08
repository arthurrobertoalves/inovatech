document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const orderCountInput = document.getElementById('orderCount');
    const confirmOrderCountBtn = document.getElementById('confirmOrderCount');
    const addressInputContainer = document.getElementById('addressInputContainer');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const cepInput = document.getElementById('cepInput');
    const addAddressBtn = document.getElementById('addAddress');
    const addressList = document.getElementById('addressList');
    const calculateRouteBtn = document.getElementById('calculateRoute');
    const clearAllBtn = document.getElementById('clearAll');
    const resultContainer = document.getElementById('resultContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const routeList = document.getElementById('routeList');
    const distanceText = document.getElementById('distanceText');
    const timeText = document.getElementById('timeText');
    const openMapsBtn = document.getElementById('openMaps');
    const exportRouteBtn = document.getElementById('exportRoute');
    const issueReportModal = document.getElementById('issueReportModal');
    const issuesList = document.getElementById('issuesList');
    const issuesCount = document.getElementById('issuesCount');
    const sendRouteReportBtn = document.getElementById('sendRouteReport');
    const ignoreIssuesBtn = document.getElementById('ignoreIssues');
    const problemReportModal = document.getElementById('problemReportModal');
    const problemLocationInput = document.getElementById('problemLocation');
    const confirmProblemReportBtn = document.getElementById('confirmProblemReport');
    const cancelProblemReportBtn = document.getElementById('cancelProblemReport');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeConfirmationModalBtn = document.getElementById('closeConfirmationModal');

    let addresses = [];
    let currentProblems = [];
    let currentRoute = null;
    let currentCep = '';

    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
    });

    confirmOrderCountBtn.addEventListener('click', function() {
        const orderCount = parseInt(orderCountInput.value);
        
        if (isNaN(orderCount)) {
            alert('Por favor, insira um número válido de encomendas.');
            return;
        }
        
        if (orderCount < 0) {
            alert('O número de encomendas não pode ser negativo.');
            return;
        }
        
        if (orderCount === 0) {
            noOrdersMessage.style.display = 'block';
            addressInputContainer.style.display = 'none';
        } else {
            noOrdersMessage.style.display = 'none';
            addressInputContainer.style.display = 'block';
        }
    });

    addAddressBtn.addEventListener('click', function() {
        const cep = cepInput.value.trim();
        const streetNumber = document.getElementById('streetNumber').value.trim();
        const complement = document.getElementById('addressComplement').value.trim();
        const priority = document.getElementById('deliveryPriority').value;

        if (!isValidCEP(cep)) {
            showAlert('Por favor, insira um CEP válido no formato 12345-678.');
            return;
        }
        
        if (!streetNumber) {
            showAlert('Por favor, insira o número do endereço.');
            return;
        }
        
        // Verificar problemas na região (postes/semáforos queimados)
        checkAreaProblems(cep).then(problems => {
            if (problems.length > 0) {
                currentProblems = problems;
                showProblemReportModal(cep, problems);
            } else {
                addAddressToList(cep, streetNumber, complement, priority);
            }
        }).catch(error => {
            console.error('Erro ao verificar problemas na área:', error);
            addAddressToList(cep, streetNumber, complement, priority);
        });
    });

    // Função para validar CEP
    function isValidCEP(cep) {
        const cepRegex = /^\d{5}-\d{3}$/;
        return cepRegex.test(cep);
    }

    // Função para verificar problemas na área (simulação)
    function checkAreaProblems(cep) {
        return new Promise((resolve) => {
            // Simulando uma chamada assíncrona a uma API
            setTimeout(() => {
                // Simulando que 30% das vezes há problemas
                const hasProblems = Math.random() < 0.3;
                
                if (hasProblems) {
                    const problemTypes = ['poste', 'semaforo'];
                    const randomProblems = [];
                    
                    // Gerar 1-3 problemas aleatórios
                    const numProblems = Math.floor(Math.random() * 3) + 1;
                    for (let i = 0; i < numProblems; i++) {
                        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
                        randomProblems.push({
                            type: type,
                            description: type === 'poste' ? 
                                'Poste de iluminação pública não está funcionando' : 
                                'Semáforo apresenta defeito ou está desligado'
                        });
                    }
                    
                    resolve(randomProblems);
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }

    // Mostrar modal de reporte de problemas
    function showProblemReportModal(cep, problems) {
        currentCep = cep;
        problemLocationInput.value = `CEP: ${cep}`;
        
        // Configurar o modal para mostrar os problemas
        const modalTitle = problemReportModal.querySelector('h3');
        const problemTypeSelect = document.getElementById('problemType');
        
        if (problems.length === 1) {
            modalTitle.innerHTML = `<i class="fas fa-lightbulb-exclamation"></i> ${problems[0].type === 'poste' ? 
                'Poste de Iluminação Defeituoso' : 'Semáforo com Problema'}`;
            problemTypeSelect.value = problems[0].type;
            problemTypeSelect.disabled = true;
        } else {
            modalTitle.innerHTML = `<i class="fas fa-lightbulb-exclamation"></i> Problemas Detectados na Área`;
            problemTypeSelect.disabled = false;
        }
        
        // Mostrar o modal
        problemReportModal.style.display = 'block';
    }

    // Confirmar reporte de problema
    confirmProblemReportBtn.addEventListener('click', function() {
        const problemType = document.getElementById('problemType').value;
        const description = document.getElementById('problemDescription').value;
        
        // Enviar o reporte por email (simulado)
        sendProblemReport(currentCep, problemType, description).then(() => {
            problemReportModal.style.display = 'none';
            showConfirmationModal(
                'Reporte Enviado com Sucesso!',
                'O problema foi reportado para a equipe de manutenção e será resolvido em breve.'
            );
            
            // Continuar com o processo de adicionar endereço
            const streetNumber = document.getElementById('streetNumber').value.trim();
            const complement = document.getElementById('addressComplement').value.trim();
            const priority = document.getElementById('deliveryPriority').value;
            addAddressToList(currentCep, streetNumber, complement, priority);
        });
    });

    // Cancelar reporte de problema
    cancelProblemReportBtn.addEventListener('click', function() {
        problemReportModal.style.display = 'none';
        
        // Continuar com o processo de adicionar endereço
        const streetNumber = document.getElementById('streetNumber').value.trim();
        const complement = document.getElementById('addressComplement').value.trim();
        const priority = document.getElementById('deliveryPriority').value;
        addAddressToList(currentCep, streetNumber, complement, priority);
    });

    // Função para enviar reporte de problema (simulação)
    function sendProblemReport(cep, problemType, description) {
        return new Promise((resolve) => {
            // Simulando envio do email
            const emailBody = `CEP: ${cep}\nTipo de Problema: ${problemType}\nDescrição: ${description || 'Não fornecida'}`;
            
            // Em uma implementação real, isso enviaria um email para arthurrobertoalves@gmail.com
            console.log('Email enviado para arthurrobertoalves@gmail.com com o conteúdo:\n', emailBody);
            
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    // Mostrar modal de confirmação
    function showConfirmationModal(title, message) {
        document.getElementById('confirmationTitle').textContent = title;
        document.getElementById('confirmationMessage').textContent = message;
        confirmationModal.style.display = 'block';
    }

    // Fechar modal de confirmação
    closeConfirmationModalBtn.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    // Adicionar endereço à lista
    function addAddressToList(cep, streetNumber, complement, priority) {
        const addressId = Date.now().toString();
        const address = {
            id: addressId,
            cep: cep,
            streetNumber: streetNumber,
            complement: complement,
            priority: priority,
            problems: currentProblems
        };
        
        addresses.push(address);
        currentProblems = [];
        renderAddressList();
        
        // Limpar campos
        cepInput.value = '';
        document.getElementById('streetNumber').value = '';
        document.getElementById('addressComplement').value = '';
        document.getElementById('deliveryPriority').value = 'normal';
    }

    // Renderizar lista de endereços
    function renderAddressList() {
        addressList.innerHTML = '';
        
        if (addresses.length === 0) {
            addressList.innerHTML = '<p class="empty-list-message">Nenhum endereço adicionado ainda.</p>';
            return;
        }
        
        addresses.forEach((address, index) => {
            const addressElement = document.createElement('div');
            addressElement.className = 'address-item';
            addressElement.dataset.id = address.id;
            
            let complementText = address.complement ? `, ${address.complement}` : '';
            let priorityBadge = '';
            
            if (address.priority === 'high') {
                priorityBadge = '<span class="priority-badge high-priority"><i class="fas fa-exclamation"></i> Alta</span>';
            } else if (address.priority === 'urgent') {
                priorityBadge = '<span class="priority-badge urgent-priority"><i class="fas fa-exclamation-triangle"></i> Urgente</span>';
            }
            
            addressElement.innerHTML = `
                <div class="address-info">
                    <span class="address-number">${index + 1}.</span>
                    <span class="address-text">CEP: ${address.cep}, Nº ${address.streetNumber}${complementText}</span>
                    ${priorityBadge}
                </div>
                <button class="btn btn-icon remove-address" title="Remover endereço">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            addressList.appendChild(addressElement);
        });
        
        // Adicionar eventos aos botões de remover
        document.querySelectorAll('.remove-address').forEach(btn => {
            btn.addEventListener('click', function() {
                const addressId = this.closest('.address-item').dataset.id;
                removeAddress(addressId);
            });
        });
    }

    // Remover endereço
    function removeAddress(addressId) {
        addresses = addresses.filter(addr => addr.id !== addressId);
        renderAddressList();
    }

    // Calcular rota
    calculateRouteBtn.addEventListener('click', function() {
        if (addresses.length === 0) {
            showAlert('Por favor, adicione pelo menos um endereço para calcular a rota.');
            return;
        }
        
        loadingIndicator.style.display = 'flex';
        resultContainer.style.display = 'none';
        
        // Simular cálculo de rota (em uma aplicação real, isso chamaria uma API)
        setTimeout(() => {
            calculateOptimalRoute();
            loadingIndicator.style.display = 'none';
            resultContainer.style.display = 'block';
        }, 2000);
    });

    // Calcular rota ótima (simulação)
    function calculateOptimalRoute() {
        // Ordenar por prioridade (urgente > alta > normal)
        const sortedAddresses = [...addresses].sort((a, b) => {
            const priorityOrder = { 'urgent': 3, 'high': 2, 'normal': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        // Simular distância e tempo (valores aleatórios)
        const totalDistance = (addresses.length * 1.5 + Math.random() * 5).toFixed(1);
        const totalTime = Math.floor(addresses.length * 10 + Math.random() * 20);
        
        // Atualizar UI
        distanceText.textContent = `${totalDistance} km`;
        timeText.textContent = `${totalTime} min`;
        
        // Renderizar lista de endereços ordenados
        routeList.innerHTML = '';
        sortedAddresses.forEach((address, index) => {
            const li = document.createElement('li');
            li.className = 'route-step';
            
            let priorityIcon = '';
            if (address.priority === 'high') {
                priorityIcon = '<i class="fas fa-exclamation priority-icon high-priority"></i>';
            } else if (address.priority === 'urgent') {
                priorityIcon = '<i class="fas fa-exclamation-triangle priority-icon urgent-priority"></i>';
            }
            
            li.innerHTML = `
                <span class="step-number">${index + 1}</span>
                <span class="step-address">CEP: ${address.cep}, Nº ${address.streetNumber}</span>
                ${priorityIcon}
            `;
            routeList.appendChild(li);
        });
        
        // Verificar problemas na rota
        checkRouteProblems(sortedAddresses).then(problems => {
            if (problems.length > 0) {
                showRouteIssues(problems);
            }
        });
        
        currentRoute = {
            addresses: sortedAddresses,
            distance: totalDistance,
            time: totalTime
        };
    }

    // Verificar problemas na rota (simulação)
    function checkRouteProblems(addresses) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const problems = [];
                
                // Verificar se algum endereço tem problemas reportados
                addresses.forEach(address => {
                    if (address.problems && address.problems.length > 0) {
                        address.problems.forEach(problem => {
                            problems.push({
                                address: `CEP: ${address.cep}, Nº ${address.streetNumber}`,
                                description: problem.description,
                                type: problem.type
                            });
                        });
                    }
                });
                
                // Adicionar alguns problemas aleatórios na rota
                if (Math.random() < 0.4) {
                    const randomProblems = [
                        'Trânsito intenso na região',
                        'Obras na pista',
                        'Possível congestionamento no horário',
                        'Rua com restrição de acesso para veículos grandes'
                    ];
                    
                    problems.push({
                        address: 'Ao longo da rota',
                        description: randomProblems[Math.floor(Math.random() * randomProblems.length)],
                        type: 'route'
                    });
                }
                
                resolve(problems);
            }, 800);
        });
    }

    // Mostrar problemas na rota
    function showRouteIssues(problems) {
        issuesList.innerHTML = '';
        problems.forEach(problem => {
            const li = document.createElement('li');
            li.className = 'route-issue';
            
            let icon = '';
            if (problem.type === 'poste') {
                icon = '<i class="fas fa-lightbulb"></i>';
            } else if (problem.type === 'semaforo') {
                icon = '<i class="fas fa-traffic-light"></i>';
            } else {
                icon = '<i class="fas fa-road"></i>';
            }
            
            li.innerHTML = `
                <div class="issue-icon">${icon}</div>
                <div class="issue-content">
                    <strong>${problem.address}</strong>
                    <p>${problem.description}</p>
                </div>
            `;
            issuesList.appendChild(li);
        });
        
        issuesCount.textContent = problems.length;
        issueReportModal.style.display = 'block';
    }

    // Enviar reporte de rota
    sendRouteReportBtn.addEventListener('click', function() {
        // Simular envio do reporte
        loadingIndicator.style.display = 'flex';
        issueReportModal.style.display = 'none';
        
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
            showConfirmationModal(
                'Rota Enviada para Análise',
                'Nossa equipe irá analisar os problemas reportados e sugerir ajustes na rota.'
            );
        }, 1500);
    });

    // Ignorar problemas e continuar
    ignoreIssuesBtn.addEventListener('click', function() {
        issueReportModal.style.display = 'none';
    });

    // Abrir no Google Maps
    openMapsBtn.addEventListener('click', function() {
        if (!currentRoute) {
            showAlert('Nenhuma rota calculada ainda.');
            return;
        }
        
        // Simular abertura no Google Maps
        const addressesParam = currentRoute.addresses.map(addr => 
            `CEP ${addr.cep}, Nº ${addr.streetNumber}`
        ).join('/');
        
        alert(`Esta funcionalidade abriria o Google Maps com a rota para:\n${addressesParam}`);
    });

    // Exportar rota
    exportRouteBtn.addEventListener('click', function() {
        if (!currentRoute) {
            showAlert('Nenhuma rota calculada ainda.');
            return;
        }
        
        // Criar conteúdo para exportação
        let exportContent = `ViaVerde - Rota Otimizada\n`;
        exportContent += `Distância total: ${currentRoute.distance} km\n`;
        exportContent += `Tempo estimado: ${currentRoute.time} minutos\n\n`;
        exportContent += `Ordem de entrega:\n`;
        
        currentRoute.addresses.forEach((addr, index) => {
            exportContent += `${index + 1}. CEP: ${addr.cep}, Nº ${addr.streetNumber}`;
            if (addr.complement) exportContent += `, ${addr.complement}`;
            if (addr.priority !== 'normal') exportContent += ` (Prioridade: ${addr.priority})`;
            exportContent += '\n';
        });
        
        // Simular download
        const blob = new Blob([exportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rota-viaverde-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Limpar tudo
    clearAllBtn.addEventListener('click', function() {
        addresses = [];
        currentRoute = null;
        renderAddressList();
        resultContainer.style.display = 'none';
        orderCountInput.value = '';
        addressInputContainer.style.display = 'none';
        noOrdersMessage.style.display = 'none';
    });

    // Fechar modais ao clicar no X
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.className === 'modal') {
            event.target.style.display = 'none';
        }
    });

    // Mostrar alerta
    function showAlert(message) {
        alert(message);
    }
});