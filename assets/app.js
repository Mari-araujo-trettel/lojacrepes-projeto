/* JavaScript para funcionalidade de filtro de itens do menu */

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filters .filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    function applyFilter(filterValue) {
        menuItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');

            // Lógica para mostrar ou esconder
            // Mostra se o filtro for 'todos' OU se a categoria do item for igual ao filtro
            if (filterValue === 'todos' || itemCategory === filterValue) {
                item.classList.remove('menu-item-hidden');
            } else {
                item.classList.add('menu-item-hidden');
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Atualiza o botão ativo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Pega o valor do data-filter e aplica
            const filter = button.getAttribute('data-filter');
            applyFilter(filter);
        });
    });

    // Estado inicial da página: aplica o filtro do PRIMEIRO botão
    if (filterButtons.length > 0) {
        filterButtons[0].classList.add('active');
        
        // ===== CORREÇÃO ESTÁ AQUI =====
        // Em vez de forçar 'todos', o script agora lê o filtro do primeiro botão
        const initialFilter = filterButtons[0].getAttribute('data-filter');
        applyFilter(initialFilter);
    }
});
/* Fim do JavaScript para funcionalidade de filtro de itens do menu */


/* JavaScript para funcionalidade de carrinho de compras */
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos principais
    const body = document.querySelector('body');
    const cartButton = document.querySelector('.cart-button .cart-link'); // Botão no header
    const floatingCart = document.querySelector('.floating-cart');
    const closeCartButton = document.querySelector('.close-cart-btn');
    const cartOverlay = document.querySelector('.cart-overlay');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Seleciona elementos dentro do carrinho
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceEl = document.getElementById('subtotal-price');
    const deliveryFeeEl = document.getElementById('delivery-fee');
    const totalPriceEl = document.getElementById('total-price');
    const cepButton = document.getElementById('calculate-cep-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');

    // Estado do carrinho (carrega do localStorage ou começa vazio)
    let cart = JSON.parse(localStorage.getItem('crepeGruCart')) || [];
    let deliveryFee = 0;

    // --- FUNÇÃO NOVA PARA ATUALIZAR O INDICADOR ---
    const updateCartIndicator = () => {
        // Pega o carrinho do localStorage. Isso é crucial
        // para que funcione em TODAS as páginas.
        const cartFromStorage = JSON.parse(localStorage.getItem('crepeGruCart')) || [];
        const count = cartFromStorage.length;
        
        // Seleciona TODOS os indicadores na página
        const indicators = document.querySelectorAll('.cart-item-count');
        
        indicators.forEach(indicator => {
            if (indicator) {
                indicator.innerText = count;
                if (count > 0) {
                    indicator.classList.add('visible');
                } else {
                    indicator.classList.remove('visible');
                }
            }
        });
    };

    // --- FUNÇÕES PRINCIPAIS ---

    const openCart = () => body.classList.add('cart-open');
    const closeCart = () => body.classList.remove('cart-open');
    
    const saveCart = () => {
        localStorage.setItem('crepeGruCart', JSON.stringify(cart));
    };

    const renderCart = () => {
        // A lógica de renderização só deve rodar se os elementos existirem (na página de cardápio)
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = ''; // Limpa a lista
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
            } else {
                cart.forEach((item, index) => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('cart-item');
                    itemElement.innerHTML = `
                        <div class="cart-item-info">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <button class="remove-item-btn" data-index="${index}">&times;</button>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                });
            }
            updateTotals();
            addRemoveEventListeners();
        }
        
        // Atualiza o indicador visual em todas as páginas
        updateCartIndicator();
    };

    const updateTotals = () => {
        // Só atualiza totais se os elementos existirem
        if (subtotalPriceEl) {
            const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
            const total = subtotal + deliveryFee;

            subtotalPriceEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            deliveryFeeEl.innerText = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
            totalPriceEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    };

    const addItemToCart = (item) => {
        cart.push(item);
        saveCart();
        renderCart();
        openCart();
    };

    const removeItemFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    };

    // --- EVENT LISTENERS ---

    // Abrir carrinho ao clicar no botão do header
    // Verifica se o botão existe antes de adicionar listener
    if (cartButton) {
        cartButton.addEventListener('click', (e) => {
            // Apenas abre o modal na página de cardápio (onde o href é #)
            if (cartButton.getAttribute('href') === '#') {
                e.preventDefault(); // Impede o link de navegar
                openCart();
            }
            // Se o href for "cardapio.html", ele navegará normalmente.
        });
    }

    // Fechar carrinho (só adiciona listeners se os elementos existirem)
    if (closeCartButton) {
        closeCartButton.addEventListener('click', closeCart);
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Adicionar item ao carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const menuItem = event.target.closest('.menu-item');
            const itemName = menuItem.querySelector('h3').innerText;
            const itemPriceText = menuItem.querySelector('.price').innerText;
            const itemPrice = parseFloat(itemPriceText.replace('R$ ', '').replace(',', '.'));
            
            addItemToCart({ name: itemName, price: itemPrice });
        });
    });

    // Adiciona listeners aos botões de remover (função só é chamada de dentro de renderCart)
    function addRemoveEventListeners() {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                removeItemFromCart(index);
            });
        });
    }

    // --- NOVA LÓGICA DE CÁLCULO DE FRETE ---
    if (cepButton) {
        cepButton.addEventListener('click', () => {
            const cep = document.getElementById('cep').value.replace(/\D/g, ''); // Remove caracteres não numéricos

            if (cep.length === 8) {
                // Verifica se o CEP pertence à região central
                if (cep.startsWith('070') || cep.startsWith('071')) {
                    deliveryFee = 7.00; // Taxa para a região central
                } else {
                    deliveryFee = 15.00; // Taxa para outras regiões de Guarulhos
                }
            } else {
                deliveryFee = 0; // Zera a taxa se o CEP for inválido
                alert('Por favor, digite um CEP válido com 8 dígitos.');
            }
            updateTotals(); // Atualiza os valores na interface do carrinho
        });
    }

    // Enviar pedido para o WhatsApp
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;

            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            if (!name || !phone || !address) {
                alert('Por favor, preencha todos os seus dados para a entrega.');
                return;
            }
            if (deliveryFee === 0 && document.getElementById('cep').value.length > 0) {
                alert('Por favor, clique em "Calcular" para confirmar a taxa de entrega antes de finalizar.');
                return;
            }

            let orderMessage = `Olá, Crepe Gru! Gostaria de fazer um pedido:\n\n`;
            cart.forEach(item => {
                orderMessage += `- ${item.name}\n`;
            });
            
            orderMessage += `\n*Subtotal:* ${subtotalPriceEl.innerText}\n`;
            orderMessage += `*Taxa de Entrega:* ${deliveryFeeEl.innerText}\n`;
            orderMessage += `*Total:* ${totalPriceEl.innerText}\n\n`;
            orderMessage += `*-- Dados para Entrega --*\n`;
            orderMessage += `*Nome:* ${name}\n`;
            orderMessage += `*Endereço:* ${address}\n`;
            orderMessage += `*Contato:* ${phone}\n`;

            const yourPhoneNumber = '5511919306469'; // SEU NÚMERO
            const encodedMessage = encodeURIComponent(orderMessage);
            const whatsappUrl = `./whatsapp.html`;
            
            window.open(whatsappUrl, '_blank');
        });
    }

    // --- INICIALIZAÇÃO ---
    // Renderiza o conteúdo do carrinho (se estiver na página de cardápio)
    // e atualiza o indicador em todas as páginas.
    renderCart(); 
    // Atualiza o indicador na carga inicial (redundante, pois renderCart() já chama, mas garante)
    updateCartIndicator();
});

/* Fim do JavaScript para funcionalidade de carrinho de compras */


/* JavaScript para formulário de contato */
document.addEventListener('DOMContentLoaded', () => {
    // Tenta selecionar o formulário de contato. O código só roda se o formulário existir na página.
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            // 1. Previne o envio padrão do formulário, que recarregaria a página.
            event.preventDefault();

            // 2. Pega os valores dos campos do formulário e remove espaços em branco extras.
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const message = document.getElementById('message').value.trim();

            // 3. Validação: verifica se algum dos campos está vazio.
            if (!name || !email || !phone || !message) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return; // Para a execução se a validação falhar.
            }

            // 4. Se todos os campos estiverem preenchidos, monta a mensagem.
            // (Este passo é opcional para o redirecionamento, mas útil se você quisesse passar os dados)
            const fullMessage = `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\n\nMensagem:\n${message}`;
            console.log('Mensagem a ser enviada:', fullMessage); // Apenas para teste no console.

            // 5. Redireciona para a página fictícia em uma nova aba.
            const whatsappUrl = `./whatsapp.html`;
            window.open(whatsappUrl, '_blank');
        });
    }
});
/* Fim do JavaScript para formulário de contato */



/* ==========================================================================
   FUNCIONALIDADE DO MENU HAMBÚRGUER 
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            // Adiciona/remove a classe 'active' para mostrar/esconder o menu
            navLinks.classList.toggle('active');
            
            // Adiciona/remove a classe 'menu-open' para bloquear/desbloquear a rolagem
            document.body.classList.toggle('menu-open');

            // Opcional: Se o seu ícone de hambúrguer muda para um "X",
            // você pode adicionar a lógica para isso aqui.
            // Ex: hamburgerMenu.classList.toggle('is-active');
        });
    }
});
