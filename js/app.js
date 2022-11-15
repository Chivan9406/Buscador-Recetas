function iniciarApp() {
    const selectCategorias = document.querySelector("#categorias")
    const resultado = document.querySelector("#resultado")

    if (selectCategorias) {
        selectCategorias.addEventListener("change", seleccionarCategoria)
        obtenerCategorias()
    }

    const favoritosDiv = document.querySelector(".favoritos")

    if (favoritosDiv) {
        obtenerFavoritos()
    }

    const modal = new bootstrap.Modal("#modal", {})

    function obtenerCategorias() {
        const url = "https://www.themealdb.com/api/json/v1/1/categories.php"
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {
            const {strCategory} = categoria
            const option = document.createElement("option")
            option.value = strCategory
            option.textContent = strCategory
            selectCategorias.appendChild(option)
        })
    }

    function seleccionarCategoria(e) {
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas(recetas = []) {
        limpiarHtml(resultado)

        const heading = document.createElement("h2")
        heading.classList.add("text-center", "text-black", "my-5")
        heading.textContent = recetas.length ? "Resultados" : "No hay resultados"
        resultado.appendChild(heading)

        recetas.forEach(receta => {
            const {idMeal, strMeal, strMealThumb} = receta

            const recetaContenedor = document.createElement("div")
            recetaContenedor.classList.add("col-md-4")

            const recetaCard = document.createElement("div")
            recetaCard.classList.add("card", "mb-4")

            const recetaImagen = document.createElement("img")
            recetaImagen.classList.add("car-img-top")
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`
            recetaImagen.src = strMealThumb ?? receta.img

            const recetaCardBody = document.createElement("div")
            recetaCardBody.classList.add("card-body")

            const recetaHeading = document.createElement("h3")
            recetaHeading.classList.add("card-title", "mb-3")
            recetaHeading.textContent = strMeal ?? receta.titulo

            const recetaButton = document.createElement("button")
            recetaButton.classList.add("btn", "btn-danger", "w-100")
            recetaButton.textContent = "Ver Receta"
            recetaButton.onclick = () => {
                seleccionarReceta(idMeal ?? receta.id)
            }

            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)
            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)
            recetaContenedor.appendChild(recetaCard)
            resultado.appendChild(recetaContenedor)
        })
    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta) {
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta
        const modalTitle = document.querySelector(".modal .modal-title")
        modalTitle.textContent = strMeal

        const modalBody = document.querySelector(".modal .modal-body")
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}">
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `

        const listGroup = document.createElement("ul")
        listGroup.classList.add("list-group")

        for (let i = 0; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]
                const ingredienteLi = document.createElement("li")
                ingredienteLi.classList.add("list-group-item")
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
                listGroup.appendChild(ingredienteLi)
            }
        }

        modalBody.appendChild(listGroup)

        const modalFooter = document.querySelector(".modal-footer")

        limpiarHtml(modalFooter)

        const btnFavorito = document.createElement("button")
        btnFavorito.classList.add("btn", "btn-danger", "col")
        btnFavorito.textContent = existeStorage(idMeal) ? "Eliminar Favorito" : "Guardar Favorito"

        btnFavorito.onclick = () => {
            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal)
                btnFavorito.textContent = "Guardar Favorito"
                mostrarToast("Eliminado Correctamente")
                return
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            })
            btnFavorito.textContent = "Eliminar Favorito"
            mostrarToast("Agregado Correctamente")
        }

        const btnCerrar = document.createElement("button")
        btnCerrar.classList.add("btn", "btn-secondary", "col")
        btnCerrar.textContent = "Cerrar"
        btnCerrar.onclick = () => {
            modal.hide()
        }

        modalFooter.appendChild(btnFavorito)
        modalFooter.appendChild(btnCerrar)

        modal.show()
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? []
        localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]))
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? []
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)
        localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos))
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? []
        return favoritos.some(favorito => favorito.id === id)
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector("#toast")
        const toastBody = document.querySelector(".toast-body")
        const toast = new bootstrap.Toast(toastDiv)
        toastBody.textContent = mensaje
        toast.show()
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem("favoritos") ?? [])

        if (favoritos.length) {
            mostrarRecetas(favoritos)
            return
        }

        const noFavoritos = document.createElement("p")
        noFavoritos.textContent = "Aún no hay favoritos"
        noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5")
        favoritosDiv.appendChild(noFavoritos)
    }

    function limpiarHtml(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }
}

document.addEventListener("DOMContentLoaded", iniciarApp)