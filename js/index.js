let commissionsData = [];
let confirmedData = [];
let waitlistData = [];
let filteredConfirmedData = [];
let filteredWaitlistData = [];

// Remove pagination for scrolling to work properly
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

      // Populate both tables with all data, no pagination
      populateConfirmedTable();
      populateWaitlistTable();

      // Equalize table heights after population
      equalizeTableWrapperHeights();
      equalizeTableHeaderHeights(); // Ensure header heights are equal

      // Hide pagination elements since we're using scrolling
      hidePaginationElements();
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function hidePaginationElements() {
  // Hide pagination elements
  const paginationControls = document.querySelectorAll(".pagination-controls");
  paginationControls.forEach((control) => {
    if (control) {
      control.style.display = "none";
    }
  });
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
  equalizeTableHeaderHeights();
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
  equalizeTableHeaderHeights();
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

  // Repopulate both tables with filtered data
  populateConfirmedTable();
  populateWaitlistTable();

  // Re-equalize table heights after filtering
  equalizeTableWrapperHeights();
  equalizeTableHeaderHeights();
}

// Function to equalize table wrapper heights
function equalizeTableWrapperHeights() {
  const wrappers = document.querySelectorAll(".table-wrapper");

  // First reset heights to auto to get true content heights
  wrappers.forEach((wrapper) => {
    wrapper.style.height = "auto";
  });

  // Set a fixed height that allows scrolling
  wrappers.forEach((wrapper) => {
    wrapper.style.height = "500px"; // Taller height to enable scrolling
    wrapper.style.overflowY = "auto"; // Ensure vertical scroll is enabled
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
