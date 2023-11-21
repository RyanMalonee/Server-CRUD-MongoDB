// Gets the cities from the server
const getCities = async () => {
  try {
    const response = await fetch("api/cities/");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Shows the city names in the list of cities box
const showCities = async () => {
  document.getElementById("cities").innerHTML = "";
  let cities = await getCities();
  cities.forEach((city) => {
    const section = document.createElement("section");
    const a = document.createElement("a");
    section.append(a);
    section.classList.add("column");
    a.href = "#";
    a.innerHTML = city.name;

    if (city.img) {
      const img = document.createElement("img");
      img.src = city.img;
      section.append(img);
    }

    document.getElementById("cities").append(section);
    a.onclick = (e) => {
      e.preventDefault();
      displayDetails(city);
    };
  });
};

// Displays the City details in the Details box
displayDetails = (city) => {
  document.getElementById("details").innerHTML = "";
  const section = document.createElement("section");
  section.classList.add("column");

  const h2 = document.createElement("h2");
  h2.innerHTML = city.name;
  section.append(h2);

  if (city.img) {
    const img = document.createElement("img");
    img.src = city.img;
    section.append(img);
  }

  const p = document.createElement("p");
  p.innerHTML = `Country: ${city.country}`;
  section.append(p);

  const p2 = document.createElement("p");
  p2.innerHTML = `Population: ${city.population}`;
  section.append(p2);

  const language = document.createElement("p");
  language.innerHTML = `Prominent Language: ${city.prominentLanguage}`;
  section.append(language);

  const landmarks = document.createElement("p");
  landmarks.innerHTML = "Landmarks: ";

  city.landmarks.forEach((landmark) => {
    if (landmark == city.landmarks[city.landmarks.length - 1]) {
      landmarks.innerHTML += `${landmark}`;
    } else {
      landmarks.innerHTML += `${landmark}, `;
    }
  });

  section.append(landmarks);

  const funFact = document.createElement("p");
  funFact.innerHTML = `Fun Fact: ${city.funFact}`;
  section.append(funFact);

  const editButton = document.createElement("a");
  editButton.innerHTML = "&#9998; ";
  editButton.classList.add("icon");
  editButton.id = "edit-button";
  section.append(editButton);

  const deleteButton = document.createElement("a");
  deleteButton.innerHTML = "&#x2715;";
  deleteButton.classList.add("icon");
  deleteButton.id = "delete-button";
  section.append(deleteButton);

  document.getElementById("details").append(section);

  editButton.onclick = (e) => {
    e.preventDefault();
    populateForm(city);
    showEditForm();
  };

  deleteButton.onclick = (e) => {
    e.preventDefault();
    deleteConfirmation(city);
  };
};

// Adds a city to the server via the form
const addCity = async (e) => {
  e.preventDefault();
  let response;

  const form = document.getElementById("add-city-form");
  const result = document.getElementById("result");
  const formData = new FormData(form);

  if (form._id.value == -1) {
    formData.delete("_id");
    response = await fetch("/api/cities", {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(`/api/cities/${form._id.value}`, {
      method: "PUT",
      body: formData,
    });
  }

  if (response.status != 200 && form._id.value == -1) {
    result.innerHTML = "Error: your city was not added";
    result.style.color = "red";
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
    return;
  }

  if (response.status != 200 && form._id.value != -1) {
    result.innerHTML = "Error: your city was not updated";
    result.style.color = "red";
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
    return;
  }
  // Waits until the city has been added to the server before it is shown
  response = await response.json();

  if (form._id.value == -1) {
    result.innerHTML = "City added successfully";
    result.style.color = "green";
    showCities();
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
    document.getElementById("add-city-form").reset();
  }

  if (form._id.value != -1) {
    //displayDetails(response);
    result.innerHTML = "City updated successfully";
    result.style.color = "green";
    const city = await getCity(form._id.value);
    displayDetails(city);
    showCities();
    setTimeout(() => {
      result.innerHTML = "";
    }, 3000);
  }
};

// Ran into issue with updating after editing...found fix on
// Portia's github
const getCity = async (id) => {
  let response = await fetch(`/api/cities/${id}`);
  if (response.status != 200) {
    console.log("ERROR: City not found");
    return;
  }
  return await response.json();
};

const populateForm = (city) => {
  const form = document.getElementById("add-city-form");
  form._id.value = city._id;
  form.cityName.value = city.name;
  form.country.value = city.country;
  form.population.value = city.population;
  form.prominentLanguage.value = city.prominentLanguage;
  form.funFact.value = city.funFact;
  // Handle the different number of landmarks
  populateLandmarks(city.landmarks);
};

const populateLandmarks = (landmarks) => {
  const input = document.getElementById("landmarks");
  landmarks.forEach((landmark) => {
    if (landmark == landmarks[landmarks.length - 1]) {
      input.value += landmark;
    } else {
      input.value += landmark + ", ";
    }
  });
};

//Delete Confirmation
const deleteConfirmation = (city) => {
  const panel = document.getElementById("delete-confirmation");
  panel.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.innerHTML = `Are you sure you want to delete ${city.name}?`;
  panel.append(h2);

  const yes = document.createElement("button");
  yes.innerHTML = "Yes";
  panel.append(yes);

  const no = document.createElement("button");
  no.innerHTML = "No";
  panel.append(no);

  panel.classList.remove("fade-out");
  panel.classList.remove("hide");
  panel.classList.add("fade-in");

  yes.onclick = () => {
    deleteCity(city);
    panel.classList.remove("fade-in");
    panel.classList.add("fade-out");
    setTimeout(() => {
      panel.classList.add("hide");
    }, 500);
  };

  no.onclick = () => {
    panel.classList.remove("fade-in");
    panel.classList.add("fade-out");
    setTimeout(() => {
      panel.classList.add("hide");
    }, 500);
  };
};

// Delete the city
const deleteCity = async (city) => {
  let response = await fetch(`/api/cities/${city._id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  if (response.status != 200) {
    console.log("Error: couldn't delete the city");
    return;
  }
  let result = await response.json();
  showCities();
  document.getElementById("details").innerHTML = "";
  document.getElementById("add-city-form").reset();
  document.getElementById("add-city-form")._id.value = -1;
};

// shows and hides the ADD form
const showForm = () => {
  const form = document.getElementById("add-city-form");
  form._id.value = -1;
  const formTitle = document.getElementById("form-title");
  formTitle.innerHTML = "Add A City";
  form.classList.remove("fade-out");
  form.classList.remove("hide");
  form.classList.add("fade-in");
};

const hideForm = () => {
  const form = document.getElementById("add-city-form");
  form.classList.remove("fade-in");
  form.classList.add("fade-out");
  setTimeout(() => {
    form.classList.add("hide");
  }, 500);
  form.reset();
};

// Changes title of add form to edit
const showEditForm = () => {
  const formTitle = document.getElementById("form-title");
  formTitle.innerHTML = "Edit A City";
  const form = document.getElementById("add-city-form");
  form.classList.remove("fade-out");
  form.classList.remove("hide");
  form.classList.add("fade-in");
};

window.onload = () => {
  showCities();
  document.getElementById("addCity").onclick = showForm;
  document.getElementById("add-city-form").onsubmit = addCity;
  document.getElementById("exit-button").onclick = hideForm;
};
