let myLibrary = [];
let id = 0;

const tbodyBooks = document.querySelector("tbody");

const buttonToggleFormAddBook = document.getElementById("buttonToggleFormAddBook");
const formAddBook = document.getElementById("formAddBook");
const buttonSaveBook = document.getElementById("submitBook");
let formDisplay = false;
formAddBook.style.display = "none";

buttonToggleFormAddBook.addEventListener("click", (e) => {
  formAddBook.style.display = formDisplay ? "none" : "inherit";
  formDisplay = !formDisplay;
});

buttonSaveBook.addEventListener("click", (e) => {
  e.preventDefault();
  processBookFormInput();
});

function Book(title, author, numberOfPages, read) {
  this.id = id++;
  (this.title = title),
    (this.author = author),
    (this.numberOfPages = numberOfPages),
    (this.read = read),
    (this.info = function () {
      return `${title} by ${author}, ${numberOfPages} pages, ${
        read ? "read" : "not read yet"
      }`;
    });
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;

  const bookRow = document.querySelector(`[data-id='${this.id}']`);
  if (bookRow) {
    bookRow.querySelector("button").textContent = this.read
      ? "Read"
      : "Not read";
  }
};

function parseBook(book) {
  if (
    book.title == "" ||
    book.author == "" ||
    book.numberOfPages == "" ||
    isNaN(book.numberOfPages)
  ) {
    return false;
  }
  return true;
}

function addEntryToBookTable(book) {
  const rowTable = document.createElement("tr");
  rowTable.dataset.id = book.id;
  Object.entries(book).forEach(([key, value]) => {
    if (key != "info" && key != "id") {
      const dataCell = document.createElement("td");
      if (key == "read") {
        const buttonRead = document.createElement("button");
        buttonRead.textContent = value ? "Read" : "Not read";
        buttonRead.addEventListener("click", (e) => {
          const book = myLibrary[e.target.parentNode.parentNode.dataset.id];
          book.toggleRead();
        });
        dataCell.appendChild(buttonRead);
      } else {
        dataCell.textContent = value;
      }
      rowTable.appendChild(dataCell);
    }
  });

  // add remove Row
  const buttonRemove = document.createElement("button");
  buttonRemove.textContent = "Remove";
  buttonRemove.addEventListener("click", (e) => {
    removeBook(e.target.parentNode.parentNode);
  });
  const dataCell = document.createElement("td");
  dataCell.appendChild(buttonRemove);
  rowTable.appendChild(dataCell);
  tbodyBooks.appendChild(rowTable);
}

function removeBook(bookRow) {
  let otherBookRow = bookRow;

  while ((otherBookRow = otherBookRow.nextSibling)) {
    otherBookRow.dataset.id = otherBookRow.dataset.id - 1;
  }

  myLibrary.splice(bookRow.dataset.id, 1);
  tbodyBooks.removeChild(bookRow);
  id--;
  saveDataToLocalStorage();
}

function processBookFormInput() {
  let title = document.getElementById("title");
  let author = document.getElementById("author");
  let numberOfPages = document.getElementById("numberOfPages");

  const newBook = new Book(
    title.value,
    author.value,
    Number(numberOfPages.value),
    false
  );

  if (!parseBook(newBook)) {
    return "Error";
  }
  myLibrary.push(newBook);
  addEntryToBookTable(newBook);
  saveDataToLocalStorage();

  title.value = "";
  author.value = "";
  numberOfPages.value = "";
}

function initializeBookTableData() {
  while (tbodyBooks.hasChildNodes()) {
    tbodyBooks.removeChild(tbodyBooks.lastChild);
  }
  myLibrary.forEach((book) => {
    addEntryToBookTable(book);
  });
}


loadDataInLocalStorage();
initializeBookTableData();


function saveDataToLocalStorage() {
  if (storageAvailable("localStorage")) {
    localStorage.setItem("bookLibrary", JSON.stringify(myLibrary));
  }
}

function loadDataInLocalStorage() {
  const bookLibraryData = localStorage.getItem("bookLibrary");
  if (bookLibraryData) {
    myLibrary = JSON.parse(bookLibraryData);
  }
}

function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}
