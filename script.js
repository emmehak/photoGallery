const galleryContainer = document.getElementById("gallery-container");
const searchInput = document.getElementById("search-input");
const searchClearButton = document.getElementById("search-clear");
const viewToggleButton = document.getElementById("view-toggle");
const filterButton = document.getElementById("filter-button");
const filterMenu = document.querySelector(".filter-menu");
let filterOptions = document.querySelectorAll(".filter-option");
const addPhotoButton = document.getElementById("add-photo-button");
const addPhotoModal = document.getElementById("add-photo-modal");
const photoModal = document.getElementById("photo-modal");
const modalPhoto = document.getElementById("modal-photo");
const modalClose = document.getElementById("modal-close");
const prevPhotoButton = document.getElementById("prev-photo");
const nextPhotoButton = document.getElementById("next-photo");
const photoTitle = document.getElementById("photo-title");
const photoCategory = document.getElementById("photo-category");
const photoDescription = document.getElementById("photo-description");
const photoLikes = document.getElementById("likes-count");
const photoDate = document.getElementById("photo-date");
const likeButton = document.getElementById("like-button");
const infoButton = document.getElementById("info-button");
const photoInfo = document.getElementById("photo-info");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const photoTitleInput = document.getElementById("photo-title-input");
const deleteButton = document.getElementById("delete-button");
const photoDescriptionInput = document.getElementById(
  "photo-description-input"
);
const photoCategorySelect = document.getElementById("photo-category-select");
const othersCategoryContainer = document.getElementById(
  "others-category-container"
);
const customCategoryInput = document.getElementById("custom-category-input");
const photoFileInput = document.getElementById("photo-file-input");
const selectedFileName = document.getElementById("selected-file-name");
const submitPhotoButton = document.getElementById("submit-photo-button");
const cancelPhotoButton = document.getElementById("cancel-photo-button");

let photos = [...galleryData];
let filteredPhotos = [...photos];
let currentCategory = "all";
let currentPhotoIndex = 0;
let isGridView = true;
let searchQuery = "";

function initGallery() {
  renderGallery();
  setupEventListeners();
}

function renderGallery() {
  loadingState.classList.remove("hidden");
  galleryContainer.innerHTML = "";
  applyFiltersAndSearch();

  setTimeout(() => {
    if (filteredPhotos.length === 0) {
      emptyState.classList.remove("hidden");
      loadingState.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    const viewClass = isGridView ? "grid-view" : "list-view";
    galleryContainer.className = viewClass;

    filteredPhotos.forEach((photo, index) => {
      const photoCard = document.createElement("div");
      photoCard.className = "photo-card";
      photoCard.dataset.index = index;

      const photoImg = document.createElement("img");
      photoImg.src = photo.imageUrl;
      photoImg.alt = photo.title;
      photoImg.loading = "lazy";

      const photoInfo = document.createElement("div");
      photoInfo.className = "photo-card-info";

      const title = document.createElement("h3");
      title.textContent = photo.title;

      const meta = document.createElement("div");
      meta.className = "photo-card-meta";

      const category = document.createElement("span");
      category.className = "category";
      category.textContent = photo.category;

      const likes = document.createElement("span");
      likes.className = "likes";
      likes.innerHTML = `<i class="fas fa-heart"></i> ${photo.likes}`;

      meta.appendChild(category);
      meta.appendChild(likes);

      photoInfo.appendChild(title);
      photoInfo.appendChild(meta);

      if (!isGridView) {
        const description = document.createElement("p");
        description.className = "description";
        description.textContent = photo.description;
        photoInfo.appendChild(description);
      }

      photoCard.appendChild(photoImg);
      photoCard.appendChild(photoInfo);

      photoCard.addEventListener("click", () => openPhotoModal(index));
      galleryContainer.appendChild(photoCard);
    });

    loadingState.classList.add("hidden");
  }, 500);
}

function applyFiltersAndSearch() {
  if (currentCategory === "all" && searchQuery === "") {
    filteredPhotos = Array.from(
      new Map(photos.map((p) => [p.imageUrl, p])).values()
    );
    return;
  }

  const matches = photos.filter((photo) => {
    const matchesCategory =
      currentCategory === "all" || photo.category === currentCategory;
    const matchesSearch =
      searchQuery === "" ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  filteredPhotos = Array.from(
    new Map(matches.map((p) => [p.imageUrl, p])).values()
  );
}

function openPhotoModal(index) {
  currentPhotoIndex = index;
  const photo = filteredPhotos[currentPhotoIndex];

  modalPhoto.src = photo.imageUrl;
  modalPhoto.alt = photo.title;
  photoTitle.textContent = photo.title;
  photoCategory.textContent = photo.category;
  photoDescription.textContent = photo.description;
  photoLikes.textContent = photo.likes;
  photoDate.textContent = formatDate(photo.date);

  const likeIcon = likeButton.querySelector("i");
  likeIcon.className = photo.isLiked ? "fas fa-heart" : "far fa-heart";

  updateNavigationButtons();
  photoModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closePhotoModal() {
  photoModal.classList.add("hidden");
  photoInfo.classList.add("hidden");
  document.body.style.overflow = "";
}

function navigateToPrevPhoto() {
  if (currentPhotoIndex > 0) {
    currentPhotoIndex--;
    openPhotoModal(currentPhotoIndex);
  }
}

function navigateToNextPhoto() {
  if (currentPhotoIndex < filteredPhotos.length - 1) {
    currentPhotoIndex++;
    openPhotoModal(currentPhotoIndex);
  }
}
function showConfirmDialog(callback) {
  const dialog = document.getElementById("confirmDialog");
  dialog.classList.remove("hidden");

  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  yesBtn.onclick = () => {
    dialog.classList.add("hidden");
    callback(true);
  };

  noBtn.onclick = () => {
    dialog.classList.add("hidden");
    callback(false);
  };
}

function removePhoto() {
  const photoToRemove = filteredPhotos[currentPhotoIndex];

  showConfirmDialog((confirmed) => {
    if (!confirmed) return;

    photos = photos.filter((p) => p.id !== photoToRemove.id);
    applyFiltersAndSearch();
    closePhotoModal();
    renderGallery();
  });
}

function updateNavigationButtons() {
  prevPhotoButton.disabled = currentPhotoIndex === 0;
  nextPhotoButton.disabled = currentPhotoIndex === filteredPhotos.length - 1;
  prevPhotoButton.classList.toggle("disabled", prevPhotoButton.disabled);
  nextPhotoButton.classList.toggle("disabled", nextPhotoButton.disabled);
}

function toggleLike() {
  const photo = filteredPhotos[currentPhotoIndex];
  const originalPhoto = photos.find((p) => p.id === photo.id);

  photo.likes += photo.isLiked ? -1 : 1;
  photo.isLiked = !photo.isLiked;
  likeButton.querySelector("i").className = photo.isLiked
    ? "fas fa-heart"
    : "far fa-heart";

  if (originalPhoto) {
    originalPhoto.likes = photo.likes;
    originalPhoto.isLiked = photo.isLiked;
  }

  photoLikes.textContent = photo.likes;

  document.querySelectorAll(".photo-card").forEach((card) => {
    const index = parseInt(card.dataset.index);
    if (filteredPhotos[index] && filteredPhotos[index].id === photo.id) {
      const likesElement = card.querySelector(".likes");
      if (likesElement) {
        likesElement.innerHTML = `<i class="fas fa-heart"></i> ${photo.likes}`;
      }
    }
  });
}

function togglePhotoInfo() {
  photoInfo.classList.toggle("hidden");
}

function toggleGalleryView() {
  isGridView = !isGridView;
  viewToggleButton.innerHTML = isGridView
    ? '<i class="fas fa-th-large"></i>'
    : '<i class="fas fa-list"></i>';
  renderGallery();
}

function toggleFilterMenu() {
  filterMenu.classList.toggle("hidden");
}

function applyCategoryFilter(category) {
  currentCategory = category;
  filterOptions.forEach((option) => {
    option.classList.toggle("active", option.dataset.category === category);
  });
  filterMenu.classList.add("hidden");
  renderGallery();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function handleSearch() {
  searchQuery = searchInput.value.trim();
  searchClearButton.classList.toggle("hidden", searchQuery === "");
  renderGallery();
}

function clearSearch() {
  searchInput.value = "";
  searchQuery = "";
  searchClearButton.classList.add("hidden");
  renderGallery();
}

function openAddPhotoModal() {
  photoTitleInput.value = "";
  photoDescriptionInput.value = "";
  photoCategorySelect.selectedIndex = 0;
  customCategoryInput.value = "";
  othersCategoryContainer.classList.add("hidden");
  photoFileInput.value = "";
  selectedFileName.textContent = "No file selected";
  addPhotoModal.classList.remove("hidden");
}

function closeAddPhotoModal() {
  addPhotoModal.classList.add("hidden");
}

function addNewPhoto() {
  const title = photoTitleInput.value.trim();
  const description = photoDescriptionInput.value.trim();
  let category;

  if (photoCategorySelect.value === "others") {
    category = customCategoryInput.value.trim();
    if (!category) return alert("Please enter a custom category");
  } else {
    category = photoCategorySelect.value;
    if (!category) return alert("Please select a category");
  }

  const file = photoFileInput.files[0];
  if (!title) return alert("Please enter a title for the photo");
  if (!file) return alert("Please select an image file");

  const imageUrl = URL.createObjectURL(file);
  const newPhoto = {
    id: photos.length + 1,
    title,
    description,
    category,
    imageUrl,
    file,
    likes: 0,
    date: new Date().toISOString().split("T")[0],
    isLiked: false,
  };

  photos.unshift(newPhoto);

  const existingCategories = Array.from(filterOptions).map(
    (option) => option.dataset.category
  );
  if (!existingCategories.includes(category) && category !== "others") {
    addCategoryToFilterMenu(category);
  }

  closeAddPhotoModal();
  renderGallery();
}

function addCategoryToFilterMenu(category) {
  const newOption = document.createElement("button");
  newOption.className = "filter-option";
  newOption.dataset.category = category;
  newOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  newOption.addEventListener("click", () => applyCategoryFilter(category));
  filterMenu.appendChild(newOption);
  filterOptions = document.querySelectorAll(".filter-option");
}

function setupEventListeners() {
  searchInput.addEventListener("input", handleSearch);
  searchClearButton.addEventListener("click", clearSearch);
  viewToggleButton.addEventListener("click", toggleGalleryView);
  filterButton.addEventListener("click", toggleFilterMenu);
  filterOptions.forEach((option) => {
    option.addEventListener("click", () =>
      applyCategoryFilter(option.dataset.category)
    );
  });

  deleteButton.addEventListener("click", removePhoto);
  addPhotoButton.addEventListener("click", openAddPhotoModal);
  submitPhotoButton.addEventListener("click", addNewPhoto);
  cancelPhotoButton.addEventListener("click", closeAddPhotoModal);
  photoFileInput.addEventListener("change", function () {
    selectedFileName.textContent = this.files?.[0]?.name || "No file selected";
  });
  photoCategorySelect.addEventListener("change", function () {
    othersCategoryContainer.classList.toggle("hidden", this.value !== "others");
  });
  modalClose.addEventListener("click", closePhotoModal);
  prevPhotoButton.addEventListener("click", navigateToPrevPhoto);
  nextPhotoButton.addEventListener("click", navigateToNextPhoto);
  likeButton.addEventListener("click", toggleLike);
  infoButton.addEventListener("click", togglePhotoInfo);
  window.addEventListener("click", (event) => {
    if (event.target === photoModal) closePhotoModal();
    if (event.target === addPhotoModal) closeAddPhotoModal();
    if (
      !filterButton.contains(event.target) &&
      !filterMenu.contains(event.target)
    ) {
      filterMenu.classList.add("hidden");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (photoModal.classList.contains("hidden")) return;
    switch (event.key) {
      case "Escape":
        closePhotoModal();
        break;
      case "ArrowLeft":
        navigateToPrevPhoto();
        break;
      case "ArrowRight":
        navigateToNextPhoto();
        break;
      case "i":
        togglePhotoInfo();
        break;
      case "l":
        toggleLike();
        break;
    }
  });
}

document.addEventListener("DOMContentLoaded", initGallery);
