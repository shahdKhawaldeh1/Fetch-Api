const photoGrid = document.getElementById("photo-grid");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

let page = 1;
let isLoading = false;
const photosPerPage = 10;

async function fetchPhotos(page) {
  try {
    const response = await fetch(
      `https://picsum.photos/v2/list?page=${page}&limit=${photosPerPage}`
    );
    const data = await response.json();
    isLoading = false;
    return data;
  } catch (error) {
    isLoading = false;
    console.error("Error fetching photos:", error);
    return [];
  }
}

async function displayPhotos() {
  const photos = await fetchPhotos(page);

  if (photos.length === 0) {
    return;
  }

  photoGrid.innerHTML = ''; // Clear existing photos

  photos.forEach((photo) => {
    const photoItem = document.createElement("div");
    photoItem.classList.add("photo-item");

    const img = document.createElement("img");
    img.src = photo.download_url;
    img.alt = "Photo";
    img.dataset.author = photo.author;

    photoItem.appendChild(img);

    img.addEventListener("click", () => {
      openModal(photo.download_url, img.dataset.author);
    });

    photoGrid.appendChild(photoItem);
  });

  updatePaginationButtons();
}

function updatePaginationButtons() {
  previousButton.disabled = page === 1;
  nextButton.disabled = isLoading;
}

previousButton.addEventListener("click", () => {
  if (page > 1) {
    page--;
    displayPhotos();
  }
});

nextButton.addEventListener("click", () => {
  if (!isLoading) {
    page++;
    displayPhotos();
  }
});

window.addEventListener("scroll", () => {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    displayPhotos();
  }
});

const modal = document.getElementById("imageModal");
const modalImage = document.querySelector(".modal-image");
const modalTitle = document.querySelector(".modal-title");
const modalDownloadButton = document.querySelector(".download-button");

let currentImageUrl = "";
let currentImageAuthor = "";

function openModal(imageUrl, author) {
  modal.style.display = "flex";
  modalImage.src = imageUrl;
  modalTitle.textContent = `Author: ${author}`;
  currentImageUrl = imageUrl;
  currentImageAuthor = author;
}

document.querySelector(".close-button").addEventListener("click", () => {
  modal.style.display = "none";
});

modalDownloadButton.addEventListener("click", () => {
  downloadImage(currentImageUrl, currentImageAuthor);
});

async function downloadImage(url, author) {
  try {
    const response = await fetch(url);
    const imageBlob = await response.blob();
    const objectURL = URL.createObjectURL(imageBlob);

    const link = document.createElement("a");
    link.href = objectURL;
    const fileName = `${author.replace(" ", "_")}_image.jpg`;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(objectURL);
  } catch (error) {
    console.error("Error downloading image:", error);
  }
}

displayPhotos();
