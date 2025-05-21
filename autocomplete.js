async function fetchProductCodes() {
    try {
        const response = await fetch('/api/productos/codigos');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Array de códigos de producto
    } catch (error) {
        console.error("Error al obtener los códigos de producto:", error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const allProductCodes = await fetchProductCodes();
    const saleItemsDiv = document.getElementById('sale-items');

    saleItemsDiv.addEventListener('input', function(event) {
        if (event.target.classList.contains('product-code-input')) {
            const inputElement = event.target;
            const inputText = inputElement.value.toUpperCase();
            const suggestionsContainerId = `autocomplete-suggestions-${inputElement.id}`;
            let suggestionsContainer = document.getElementById(suggestionsContainerId);

            if (!suggestionsContainer) {
                suggestionsContainer = document.createElement("div");
                suggestionsContainer.id = suggestionsContainerId;
                suggestionsContainer.classList.add("autocomplete-suggestions");
                inputElement.parentNode.appendChild(suggestionsContainer);
                suggestionsContainer.style.position = 'absolute'; // Para que se posicione debajo del input
                suggestionsContainer.style.zIndex = '10'; // Para que esté por encima de otros elementos
                suggestionsContainer.style.backgroundColor = 'white'; // Fondo blanco
                suggestionsContainer.style.border = '1px solid #ccc'; // Borde sutil
                suggestionsContainer.style.width = inputElement.offsetWidth + 'px'; // Ancho igual al input
                suggestionsContainer.style.boxSizing = 'border-box'; // Incluir padding y border en el ancho
                suggestionsContainer.style.maxHeight = '150px'; // Altura máxima con scroll
                suggestionsContainer.style.overflowY = 'auto'; // Scroll si hay muchas sugerencias
                suggestionsContainer.style.display = 'none';
            } else {
                suggestionsContainer.innerHTML = ""; // Limpiar sugerencias anteriores
            }

            if (inputText.length > 0) {
                const matchingCodes = allProductCodes.filter(code =>
                    code.startsWith(inputText)
                );

                if (matchingCodes.length > 0) {
                    matchingCodes.forEach(code => {
                        const suggestionItem = document.createElement("div");
                        suggestionItem.textContent = code;
                        suggestionItem.classList.add("suggestion-item");
                        suggestionItem.style.padding = '5px';
                        suggestionItem.style.cursor = 'pointer';
                        suggestionItem.addEventListener("mouseover", function() {
                            this.style.backgroundColor = '#f0f0f0';
                        });
                        suggestionItem.addEventListener("mouseout", function() {
                            this.style.backgroundColor = 'white';
                        });
                        suggestionItem.addEventListener("click", function() {
                            inputElement.value = code;
                            suggestionsContainer.style.display = 'none';
                            inputElement.focus(); // Devolver el foco al input después de la selección
                            // Disparar el evento 'blur' manualmente para que se busque el producto
                            inputElement.dispatchEvent(new Event('blur'));
                        });
                        suggestionsContainer.appendChild(suggestionItem);
                    });
                    suggestionsContainer.style.display = 'block';
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }
    });

    document.addEventListener("click", function(event) {
        const allSuggestions = document.querySelectorAll('.autocomplete-suggestions');
        allSuggestions.forEach(container => {
            const relatedInputId = container.id.replace('autocomplete-suggestions-', '');
            const relatedInput = document.getElementById(relatedInputId);
            if (event.target !== relatedInput && !container.contains(event.target)) {
                container.style.display = 'none';
            }
        });
    });
});