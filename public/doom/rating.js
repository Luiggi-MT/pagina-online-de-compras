// Este script se ejecutará cuando la página haya terminado de cargarse
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Iniciando fetch de ratings...');
  
  // Obtener todos los elementos con la clase "stars"
  const eleStars = document.getElementsByClassName('stars');
  for (const ele of eleStars) {
    const productId = ele.dataset._id; // Obtener el `_id` desde el atributo `data-_id`
    
    // Delegación de eventos: agregar el evento de clic al contenedor de las estrellas
    ele.addEventListener('click', (evt) => {
      // Verifica si el clic fue sobre una estrella
      if (evt.target.classList.contains('fa-star')) {
        Vota(evt);
      }
    });

    // Obtener y mostrar las estrellas iniciales
    await obtenerRating(productId, ele);
  }
});

// Función para obtener el rating desde el API y actualizar las estrellas
async function obtenerRating(productId, ele) {
  try {
    const response = await fetch(`/api/ratings/${productId}`);
    if (!response.ok) {
      throw new Error('Error al obtener rating');
    }
    const data = await response.json();
    const { rating } = data;

    // Llenar las estrellas según el rating
    const maxStars = 5;
    const fullStars = Math.floor(rating.rate);
    const halfStar = rating.rate % 1 >= 0.5;
    let htmlStars = '';
    
    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      htmlStars += `<span class="fa fa-star filled" data-star="${i + 1}" data-_id="${productId}"></span>`;
    }

    // Media estrella
    if (halfStar) {
      htmlStars += `<span class="fa fa-star partial" data-star="${fullStars + 1}" data-_id="${productId}"></span>`;
    }

    // Estrellas vacías
    for (let i = fullStars + halfStar; i < maxStars; i++) {
      htmlStars += `<span class="fa fa-star empty" data-star="${i + 1}" data-_id="${productId}"></span>`;
    }

    // Actualizar el HTML de las estrellas
    ele.innerHTML = `
      ${htmlStars}
      <small class="text-muted">(${rating.count} opiniones)</small>
    `;
  } catch (error) {
    console.error(`Error al obtener rating del producto ${productId}:`, error);
  }
}

// Manejador de evento para votar
async function Vota(evt) {
  const ide = evt.target.dataset._id; // ID del producto (en el dataset)
  const response = await fetch(`/api/ratings/${ide}`)
  const data = await response.json();
  const { rating } = data;
  const pun = parseInt(evt.target.dataset.star) + rating.rate / (rating.count + 1); // Número de la estrella seleccionada
  // Optimistic update: renderizamos inmediatamente el nuevo rating asumido
  const numCount = rating.count +1; 
  const parent = evt.target.parentElement; // Contenedor de las estrellas
  renderOptimisticStars(parent, pun);


  // Fetch para enviar la nueva calificación al servidor
  fetch(`/api/ratings/${ide}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate: pun, count: numCount })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json(); // Convierte la respuesta a JSON
  })
  .then(data => {
    if (!data.rating) {
      throw new Error(`Rating no actualizado para producto ${ide}`);
    }
    // Actualiza con la respuesta del servidor
    const updatedRate = data.rating.rate;
    const updatedVotes = data.rating.count;
    renderStars(parent, updatedRate, updatedVotes, ide);
    location.reload(); // Recarga la página para mostrar los datos actualizados
  })
  .catch(error => {
    console.error(`Error al enviar el rating para producto ${ide}:`, error);
    // Revertir los cambios optimistas en caso de error
    fetch(`/api/ratings/${ide}`)
    .then(response => response.json())
    .then(data => {
      const fallbackRate = data.producto.rating.rate;
      const fallbackVotes = data.producto.rating.count;
      renderStars(parent, fallbackRate, fallbackVotes, ide);
    });
  });
}

// Función para renderizar las estrellas de forma optimista
function renderOptimisticStars(parent, starNumber) {
  const stars = parent.querySelectorAll('.fa-star');
  stars.forEach(star => {
    if (parseInt(star.dataset.star) <= starNumber) {
      star.classList.add('filled');
      star.classList.remove('empty', 'partial');
    } else {
      star.classList.remove('filled', 'partial');
      star.classList.add('empty');
    }
  });
}

// Función para renderizar las estrellas finales
function renderStars(parent, rating, votes, productId) {
  const stars = parent.querySelectorAll('.fa-star');
  stars.forEach(star => {
    const starValue = parseInt(star.dataset.star);
    if (starValue <= rating) {
      star.classList.add('filled');
      star.classList.remove('empty', 'partial');
    } else {
      star.classList.remove('filled', 'partial');
      star.classList.add('empty');
    }
  });

  parent.innerHTML += `
    <small class="text-muted">(${votes} opiniones)</small>
  `;
}
