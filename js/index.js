let currentConfirmedPage = 1;
let currentWaitlistPage = 1;
const rowsPerPage = 7;
let commissionsData = [];
let confirmedData = [];
let waitlistData = [];
let filteredConfirmedData = [];
let filteredWaitlistData = [];

function paginateTable(tableId, page) {
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

  // Determine which dataset to use based on the table ID
  let totalData, filteredData;
  if (tableId === "confirmed-table") {
    totalData = filteredConfirmedData.length > 0 ? filteredConfirmedData.length : confirmedData.length;
    currentConfirmedPage = page;
  } else if (tableId === "waitlist-table") {
    totalData = filteredWaitlistData.length > 0 ? filteredWaitlistData.length : waitlistData.length;
    currentWaitlistPage = page;
  }

  const totalPages = Math.ceil(totalData / rowsPerPage);

  // Hide all rows
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = "none";
  }

  // Show rows for the current page
  for (let i = (page - 1) * rowsPerPage; i < page * rowsPerPage && i < totalData; i++) {
    if (i < rows.length) {
      rows[i].style.display = "";
    }
  }

  // Disable buttons based on the current page
  const prevBtn = document.getElementById(`${tableId}-prev`);
  const nextBtn = document.getElementById(`${tableId}-next`);
  const firstBtn = document.getElementById(`${tableId}-first`);
  const lastBtn = document.getElementById(`${tableId}-last`);

  if (prevBtn && nextBtn && firstBtn && lastBtn) {
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;
    firstBtn.disabled = page === 1;
    lastBtn.disabled = page === totalPages;
  }

  renderPageNumbers(tableId, totalPages, page);
}

function renderPageNumbers(tableId, totalPages, currentPage) {
  let pageNumbersId;
  if (tableId === "confirmed-table") {
    pageNumbersId = "confirmed-page-numbers";
  } else if (tableId === "waitlist-table") {
    pageNumbersId = "waitlist-page-numbers";
  }

  const pageNumbersContainer = document.getElementById(pageNumbersId);
  if (!pageNumbersContainer) return;

  pageNumbersContainer.innerHTML = "";

  const maxVisiblePages = window.innerWidth < 440 ? 1 : 3;
  let startPage, endPage;

  if (totalPages <= maxVisiblePages) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    startPage = Math.max(1, currentPage - halfVisible);
    endPage = Math.min(totalPages, currentPage + halfVisible);

    if (startPage === 1) {
      endPage = Math.min(maxVisiblePages, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button");
    pageButton.innerText = i;
    pageButton.className = currentPage === i ? "active" : "";
    pageButton.onclick = () => {
      paginateTable(tableId, i);
    };
    pageNumbersContainer.appendChild(pageButton);
  }
}

function changePage(tableId, direction) {
  let currentPage, totalData;

  if (tableId === "confirmed-table") {
    currentPage = currentConfirmedPage;
    totalData = filteredConfirmedData.length > 0 ? filteredConfirmedData.length : confirmedData.length;
  } else if (tableId === "waitlist-table") {
    currentPage = currentWaitlistPage;
    totalData = filteredWaitlistData.length > 0 ? filteredWaitlistData.length : waitlistData.length;
  }

  const totalPages = Math.ceil(totalData / rowsPerPage);

  if (direction === "first") {
    currentPage = 1;
  } else if (direction === "last") {
    currentPage = totalPages;
  } else {
    currentPage += direction;
  }

  // Ensure currentPage stays within bounds
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  paginateTable(tableId, currentPage);
}

document.addEventListener("DOMContentLoaded", () => {
  loadGoogleSheetData();

  // Listen for window resize to adjust table heights
  window.addEventListener("resize", equalizeTableWrapperHeights);
});

function loadGoogleSheetData() {
  fetch("https://script.google.com/macros/s/AKfycbzwxGvC7bRWRc2yRyrgib9F7IOvtuw3Qx69Z8Qt8I7LDaU-PDKjBka8IVbHKtHW9flx/exec")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      commissionsData = data.slice(1); // Exclude the first entry which is the month's name

      // Set the month's name
      if (data.length > 0) {
        document.getElementById("month-name").innerText = data[0].month;
      }

      // Split data based on status
      splitDataByStatus();

      // Populate both tables
      populateConfirmedTable();
      populateWaitlistTable();

      // Initialize pagination for both tables
      paginateTable("confirmed-table", 1);
      paginateTable("waitlist-table", 1);

      // Equalize table heights after population
      equalizeTableWrapperHeights();
      equalizeTableHeaderHeights(); // Ensure header heights are equal
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function splitDataByStatus() {
  confirmedData = commissionsData.filter((item) => item.status && item.status.toLowerCase() === "confirmed");

  waitlistData = commissionsData.filter((item) => !item.status || item.status.toLowerCase() !== "confirmed");

  // Initialize filtered data
  filteredConfirmedData = confirmedData;
  filteredWaitlistData = waitlistData;
}

function displayNoRecordsMessage(tableId) {
  const tableBody = document.querySelector(`#${tableId} tbody`);

  // Check how many columns the table has
  const headerCells = document.querySelectorAll(`#${tableId} thead th`).length;

  tableBody.innerHTML = `<tr><td colspan="${headerCells}">No records available.</td></tr>`;

  const prevBtn = document.getElementById(`${tableId}-prev`);
  const nextBtn = document.getElementById(`${tableId}-next`);
  const firstBtn = document.getElementById(`${tableId}-first`);
  const lastBtn = document.getElementById(`${tableId}-last`);

  if (prevBtn && nextBtn && firstBtn && lastBtn) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    firstBtn.disabled = true;
    lastBtn.disabled = true;
  }
}

function populateConfirmedTable() {
  const tableBody = document.querySelector("#confirmed-table tbody");
  tableBody.innerHTML = "";

  const dataToDisplay = filteredConfirmedData.length > 0 ? filteredConfirmedData : confirmedData;

  if (dataToDisplay.length === 0) {
    displayNoRecordsMessage("confirmed-table");
    return;
  }

  dataToDisplay.forEach((item) => {
    const row = document.createElement("tr");
    const progressValue = item.progress;
    const progressPercentage = getProgressPercentage(progressValue);

    row.innerHTML = `
      <td>${item.name}</td>
      <td class="status-confirmed">${item.status !== undefined ? item.status : "N/A"}</td>
      <td>${formatDate(item.startDate)}</td>
      <td>${item.type}</td>
      <td>${item.estimatedTime !== undefined ? item.estimatedTime : "N/A"}</td>
      <td>
        ${progressValue !== undefined ? progressValue : "N/A"}
        <div class="progress-bar">
          <div class="progress" style="width: ${progressPercentage}%;"></div>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Call after populating
  equalizeTableWrapperHeights();
  equalizeTableHeaderHeights(); // Ensure header heights are equal
}

function populateWaitlistTable() {
  const tableBody = document.querySelector("#waitlist-table tbody");
  tableBody.innerHTML = "";

  const dataToDisplay = filteredWaitlistData.length > 0 ? filteredWaitlistData : waitlistData;

  if (dataToDisplay.length === 0) {
    displayNoRecordsMessage("waitlist-table");
    return;
  }

  dataToDisplay.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatDate(item.startDate)}</td>
      <td>${item.type}</td>
    `;
    tableBody.appendChild(row);
  });

  // Call after populating
  equalizeTableWrapperHeights();
  equalizeTableHeaderHeights(); // Ensure header heights are equal
}

function filterTables(filterId) {
  const input = document.getElementById(filterId);
  const filter = input.value.toLowerCase();

  // Filter confirmed data
  filteredConfirmedData = confirmedData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  // Filter waitlist data
  filteredWaitlistData = waitlistData.filter((item) => {
    return Object.values(item).some((value) => String(value).toLowerCase().includes(filter));
  });

  // Repopulate both tables
  populateConfirmedTable();
  populateWaitlistTable();

  // Reset pagination for both tables
  paginateTable("confirmed-table", 1);
  paginateTable("waitlist-table", 1);

  // Re-equalize table heights after filtering
  equalizeTableWrapperHeights();
  equalizeTableHeaderHeights(); // Ensure header heights are equal
}

// Function to equalize table wrapper heights
function equalizeTableWrapperHeights() {
  const wrappers = document.querySelectorAll(".table-wrapper");
  let maxHeight = 0;

  // Find the maximum content height (not including the header)
  wrappers.forEach((wrapper) => {
    // First reset heights to auto to get true content height
    wrapper.style.height = "auto";

    const table = wrapper.querySelector("table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    // Calculate content height (table height minus header height)
    const contentHeight = tbody.getBoundingClientRect().height;

    if (contentHeight > maxHeight) {
      maxHeight = contentHeight;
    }
  });

  // Set minimum height
  maxHeight = Math.max(maxHeight, 200);

  // Set maximum height (with scrolling)
  maxHeight = Math.min(maxHeight, 400);

  // Set all wrappers to the same height
  wrappers.forEach((wrapper) => {
    const headerHeight = wrapper.querySelector("table thead").getBoundingClientRect().height;
    wrapper.style.height = maxHeight + headerHeight + "px";
  });
}

// Function to equalize table header heights
function equalizeTableHeaderHeights() {
  // Get all table headers on the index page
  const tableHeaders = document.querySelectorAll("#confirmed-table thead, #waitlist-table thead");

  // Find the maximum height
  let maxHeight = 0;
  tableHeaders.forEach((header) => {
    // Reset any previously set inline height to get true height
    header.style.height = "auto";
    const headerHeight = header.offsetHeight;
    if (headerHeight > maxHeight) {
      maxHeight = headerHeight;
    }
  });

  // Set all headers to the maximum height
  maxHeight = Math.max(maxHeight, 50); // Minimum of 50px
  tableHeaders.forEach((header) => {
    header.style.height = maxHeight + "px";

    // Also ensure all th elements have the same height
    const thElements = header.querySelectorAll("th");
    thElements.forEach((th) => {
      th.style.height = maxHeight + "px";
    });
  });
}

function getProgressPercentage(progress) {
  switch (progress) {
    case "Sketching":
      return 33;
    case "Rendering":
      return 66;
    case "Finished":
      return 100;
    default:
      return 0;
  }
}

function formatDate(dateString) {
  if (!dateString || dateString === "-") {
    return "-";
  }
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}
