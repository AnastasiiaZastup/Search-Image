

/*const selectors = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    button: document.querySelector('.load-more'),
    input: document.querySelector('[name = "searchQuery"]')
}

selectors.form.addEventListener('submit', startSubmit);
selectors.button.addEventListener('click', startClick);

async function startSubmit(event) {
    event.preventDefault();

}

 const params = {
      key: API_KEY,
      q: selectors.input.value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
};*/
  

import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '39915563-624de55954f525a041c98bd73';
const PER_PAGE = 40;

const selectors = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery'),
  button: document.querySelector('.load-more'),
};

selectors.button.style.display = 'none';
let page = 1;

selectors.form.addEventListener('submit', onSubmit);
selectors.button.addEventListener('click', loadMoreImages);

async function fetchData(params) {
  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error('An error occurred while fetching data. Please try again later.');
  }
}

function updateGallery(data) {
  const { hits, totalHits } = data;

  if (hits.length === 0) {
    selectors.gallery.innerHTML = '';
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  } else {
    selectors.gallery.innerHTML = createMarkup(hits);

    selectors.button.style.display = totalHits > page * PER_PAGE ? 'block' : 'none';

    if (totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    initializeLightbox();
  }
}

async function onSubmit(event) {
  event.preventDefault();
  page = 1;
  const searchQuery = selectors.input.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  const params = {
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
  };

  try {
    const data = await fetchData(params);
    updateGallery(data);
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function createMarkup(images) {
  return images
    .map(
      ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
        <div class="photo-card">
          <a class="gallery-link" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" />
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes<br> ${likes}</b>
            </p>
            <p class="info-item">
              <b>Views<br> ${views}</b>
            </p>
            <p class="info-item">
              <b>Comments<br> ${comments}</b>
            </p>
            <p class="info-item">
              <b>Downloads<br> ${downloads}</b>
            </p>
          </div>
        </div>
      `
    )
    .join('');
}

async function loadMoreImages() {
  page += 1;
  const searchQuery = selectors.input.value.trim();

  const params = {
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
    page,
  };

  try {
    const data = await fetchData(params);

    if (data.hits.length === 0) {
      selectors.button.style.display = 'none';
    } else {
      const newPhotosMarkup = createMarkup(data.hits);
      selectors.gallery.insertAdjacentHTML('beforeend', newPhotosMarkup);
      selectors.button.style.display = data.totalHits > page * PER_PAGE ? 'block' : 'none';
      Notiflix.Notify.info("You've reached the end of search results.");
      initializeLightbox();
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

function initializeLightbox() {
  new SimpleLightbox('.gallery a', {
    close: true,
  });
}
