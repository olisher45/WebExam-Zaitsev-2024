'use strict';
const API_KEY = "4d695ee6-4b30-4958-abaa-ce363de76996";
let routes = [];
const ordersContainer = document.getElementById('ordersSection');
const ordersTableBody = document.getElementById('orders');
const paginationContainer = document.getElementById('paginationOrders');
const itemsPerPage = 3;
let data;
let totalPages;
let startIndex;
let endIndex;
let currentPage = 1;
let currentGuide;
let currentOrder;

function showNotification(message, className) {
    const notificationElement = document.getElementById("notification");
    notificationElement.classList.remove(
        "alert-success", "alert-danger", "alert-info");
    notificationElement.classList.add(className);
    notificationElement.innerHTML = `Уведомление: ${message}`;
    notificationElement.classList.remove("d-none");
    setTimeout(function() {
        notificationElement.classList.add("d-none");
    }, 5000);

}


function displayOrders() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const ordersToDisplay = data.slice(startIndex, endIndex);
    ordersTableBody.innerHTML = '';
    displayPagination(); 
    //Функции вызывают друг друга с условием, исключащем бесконечный цикл

    ordersToDisplay.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-wrap">${order.id}</td>
            <td class="text-wrap">
            ${routes.find(route => route.id === order.route_id).name}</td>
            <td class="text-wrap">${order.date}</td>
            <td class="text-wrap">${order.price}</td>
            <td class="text-center">
                <div class="row mx-2">
                    <div class="col-md-4 my-3 my-md-0">
                    <a title="Посмотреть" onclick="openViewModal(${order.id})">
                            <i class="fas fa-eye"></i>
                    </a>
                    </div>
                    <div class="col-md-4 my-3 my-md-0">
                    <a title="Редактировать" onclick="openEditModal(
                        ${order.id})">
                        <i class="fas fa-edit"></i>
                    </a>
                    </div>
                    <div class="col-md-4 my-3 my-md-0">
                        <a title="Удалить" onclick="confirmDelete(${order.id})">
                            <i class="fas fa-trash"></i>
                        </a>
                    </div>
                </div>
            </td>
        `;
        ordersTableBody.appendChild(tr);
    });
}

function displayPagination() {
    const paginationElement = document.getElementById('paginationOrders');
    paginationElement.innerHTML = '';
    if (currentPage > totalPages) {
        currentPage = 1;
    }

    const prevButton = document.createElement('li');
    prevButton.classList.add('page-item');
    if (currentPage === 1) {
        prevButton.classList.add('disabled');
    }
    const prevLink = document.createElement('a');
    prevLink.classList.add('page-link');
    prevLink.href = '#ordersSection';
    prevLink.innerHTML = '&laquo;';
    prevLink.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayOrders();
        }
    });
    prevButton.appendChild(prevLink);
    paginationElement.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');

        const a = document.createElement('a');
        if (i === currentPage) {
            a.classList.add('active-nav');
        }
        a.classList.add('page-link');
        a.href = "#ordersSection";
        a.textContent = i;
        a.addEventListener('click', () => {
            currentPage = i;
            displayOrders();
        });
        li.appendChild(a);
        paginationElement.appendChild(li);
    }
    const nextButton = document.createElement('li');
    nextButton.classList.add('page-item');
    if (currentPage === totalPages) {
        nextButton.classList.add('disabled');
    }
    const nextLink = document.createElement('a');
    nextLink.classList.add('page-link');
    nextLink.href = '#ordersSection';
    nextLink.innerHTML = '&raquo;';
    nextLink.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayOrders();
        }
    });
    nextButton.appendChild(nextLink);
    paginationElement.appendChild(nextButton);
}

async function getOrders() {
    const url = new URL(
        'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders');
    url.searchParams.set('api_key', API_KEY);
    currentPage = 1;
    let response = await fetch(url);
    if (response.ok) {
        data = await response.json();
        totalPages = Math.ceil(data.length / itemsPerPage);
        displayOrders();
    } else {
        showNotification(
            "Ошибка при получении списка заказов.", "alert-danger");
    }
    
}

async function deleteOrder(orderId) {
    try {
        const url = new URL(
            `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/` +
            `${orderId}`);
        url.searchParams.set('api_key', API_KEY);
        const response = await fetch(url, { method: 'DELETE' });
        console.log(response);
        if (response.ok) {
            showNotification("Заявка удалена.", "alert-info");
        } else {
            showNotification("Ошибка при удалении заявки.", "alert-danger");
        }
    } catch (error) {
        console.error(error);
        showNotification(error, "alert-danger");
    }

    
}


async function loadRoutes() {
    let url = new URL(
        "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes");
    url.searchParams.set("api_key", API_KEY);
    let response = await fetch(url);
    if (response.ok) {
        routes = await response.json();
        getOrders();
    } else {
        showNotification(
            "Ошибка при получении списка маршрутов.", "alert-danger");
    }
}


async function getGuide(guideId) {
    let url = new URL(
        `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/` +
        `${guideId}`);
    url.searchParams.set("api_key", API_KEY);
    let response = await fetch(url);
    if (response.ok) {
        return await response.json();
    } else {
        showNotification(
            "Ошибка при получении информации о гиде.", "alert-danger");
        return "Не найдено";
    }
    
}

async function openViewModal(orderId) {
    const order = data.find(item => item.id === orderId);
    const route = routes.find(route => route.id === order.route_id);
    const guide = await getGuide(order.guide_id);
    document.getElementById("ModalLabel").textContent = 
    "Просмотр заявки №" + order.id;
    document.getElementById("routeName").value = route.name;
    document.getElementById("guideName").value = guide.name;
    document.getElementById("excursionDate").value = order.date;
    document.getElementById("excursionDate").setAttribute("readonly", "true");
    document.getElementById("startHour").innerHTML = 
    `<option> ${order.time.split(":")[0]} </option>`;
    document.getElementById("startHour").setAttribute("disabled", "true");
    document.getElementById("startMinute").innerHTML = 
    `<option> ${order.time.split(":")[1]} </option>`;
    document.getElementById("startMinute").setAttribute("disabled", "true");
    document.getElementById("duration").value = order.duration;
    document.getElementById("duration").setAttribute("disabled", "true");
    document.getElementById("groupSize").value = order.persons;
    document.getElementById("groupSize").setAttribute("disabled", "true");
    document.getElementById("seniorDiscount").setAttribute(
        "checked", order.optionFirst);
    document.getElementById("seniorDiscount").setAttribute(
        "disabled", true);
    document.getElementById("snackOption").setAttribute(
        "checked", order.optionSecond);
    document.getElementById("snackOption").setAttribute(
        "disabled", true);
    document.getElementById("totalCost").value = 
    order.price;
    document.getElementById("totalCost").setAttribute(
        "disabled", true);
    document.getElementById("submitButtons").classList.add(
        "d-none");
    

    const viewModal = new bootstrap.Modal(
        document.getElementById('bookingModal'));
    viewModal.show();
}

function isWeekend(day) {
    return day === 0 || day === 6;
}

function isHoliday(date) {
    const holidays = [
        "2024-01-01", "2024-01-02", "2024-01-03", 
        "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-08",
        "2024-01-07", "2024-02-23", "2024-03-08", 
        "2024-05-01", "2024-05-09", "2024-06-12", "2024-11-04"
    ];
    return holidays.includes(date.toISOString().split('T')[0]);
}

function calculateTotalCost() {
    try {
        const startTime = parseInt(document.getElementById(
            'startHour').value, 10);
        const selectedGuide = currentGuide;
        const duration = parseInt(document.getElementById(
            'duration').value, 10);
        const groupSize = parseInt(document.getElementById(
            'groupSize').value, 10);
        const isItMorning = startTime >= 9 && startTime < 12 ? 400 : 0;
        const isItEvening = startTime >= 20 && startTime < 23 ? 1000 : 0;
        const numberOfVisitors = 
        groupSize <= 5 ? 0 : (groupSize <= 10 ? 1000 : 1500);

        const guideServiceCost = selectedGuide.pricePerHour;
        const hoursNumber = duration;

        const selectedDateInput = document.getElementById('excursionDate');
        const selectedDate = new Date(selectedDateInput.value);
        const dayOfWeek = selectedDate.getDay();
        const isDayOff = isWeekend(dayOfWeek) || isHoliday(selectedDate);

        let totalCost = guideServiceCost * 
        hoursNumber * (isDayOff ? 1.5 : 1) + 
        isItMorning + isItEvening + numberOfVisitors;

        const isSeniorDiscount = document.getElementById(
            'seniorDiscount').checked;
        if (isSeniorDiscount) {
            totalCost *= 0.75;
        }

        const isSnackOption = document.getElementById('snackOption').checked;
        if (isSnackOption) {
            const snackCost = 1000 * groupSize;
            totalCost += snackCost;
        }

        document.getElementById('totalCost').value = totalCost;
    } catch (event) {
        console.log(event);
        document.getElementById('totalCost').value = 0;
    }
}

const startHourSelect = document.getElementById('startHour');
const startMinuteSelect = document.getElementById('startMinute');

const generateHourOptions = () => {
    const hours = [];
    for (let i = 9; i <= 23; i++) {
        hours.push(i);
    }
    return hours;
};

const generateMinuteOptions = () => {
    const minutes = [0, 30];
    return minutes;
};

const hourOptions = generateHourOptions();
const minuteOptions = generateMinuteOptions();


async function openEditModal(orderId) {
    hourOptions.innerHTML = '';
    minuteOptions.innerHTML = '';
    hourOptions.forEach(hour => {
        const optionElement = document.createElement('option');
        optionElement.value = hour;
        optionElement.text = hour.toString().padStart(2, '0');
        startHourSelect.add(optionElement);
    });
    
    minuteOptions.forEach(minute => {
        const optionElement = document.createElement('option');
        optionElement.value = minute;
        optionElement.text = minute.toString().padStart(2, '0');
        startMinuteSelect.add(optionElement);
    });
    
    const order = data.find(item => item.id === orderId);
    const route = routes.find(route => route.id === order.route_id);
    const guide = await getGuide(order.guide_id);
    currentGuide = guide;
    currentOrder = order;
    document.getElementById("ModalLabel").textContent = 
    "Редактирование заявки №" + order.id;;
    document.getElementById("routeName").value = route.name;
    document.getElementById("guideName").value = guide.name;
    document.getElementById("excursionDate").value = order.date;
    document.getElementById("excursionDate").removeAttribute("readonly");
    document.getElementById("startHour").value = 
    parseInt(order.time.split(":")[0], 10);
    document.getElementById("startHour").removeAttribute("disabled");
    document.getElementById("startMinute").value = 
    parseInt(order.time.split(":")[1], 10);;
    document.getElementById("startMinute").removeAttribute("disabled");
    document.getElementById("duration").value = order.duration;
    document.getElementById("duration").removeAttribute("disabled");
    document.getElementById("groupSize").value = order.persons;
    document.getElementById("groupSize").removeAttribute("disabled");
    document.getElementById("seniorDiscount").setAttribute(
        "checked", order.optionFirst);
    document.getElementById("seniorDiscount").removeAttribute("disabled");
    document.getElementById("snackOption").setAttribute(
        "checked", order.optionSecond);
    document.getElementById("snackOption").removeAttribute("disabled");
    document.getElementById("totalCost").value = order.price;
    document.getElementById("totalCost").removeAttribute("disabled");
    document.getElementById("submitButtons").classList.remove("d-none");
    
    const viewModal = new bootstrap.Modal(document.getElementById(
        'bookingModal'));
    viewModal.show();
}

async function changeOrder() {
    try {
        let id = document.getElementById(
            "ModalLabel").textContent.split("№")[1];
        let url = new URL(
            `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/`
            + `${id}`);
        url.searchParams.set("api_key", API_KEY);

        const formData = new URLSearchParams();
        formData.append("date", document.getElementById("excursionDate").value);
        formData.append("duration", document.getElementById("duration").value);
        formData.append("guide_id", currentGuide.id);
        formData.append("optionFirst", document.getElementById(
            "seniorDiscount").checked + 0);
        formData.append("optionSecond", document.getElementById(
            "snackOption").checked + 0);
        formData.append("persons", document.getElementById("groupSize").value);
        formData.append("price", Math.floor(document.getElementById(
            "totalCost").value));
        formData.append("route_id", currentOrder.route_id);
        formData.append("time", document.getElementById(
            "startHour").value + ":" + document.getElementById(
            "startMinute").value + ":" + "00");

        let response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (response.ok) {
            showNotification("Заявка успешно отправлена.", "alert-success");
        } else {
            showNotification("Ошибка при отправке заявки.", "alert-danger");
        }
        getOrders();
    } catch (error) {
        console.error(error);
        showNotification(error, "alert-danger");
    }

}

let funClick;

function confirmDelete(orderId) {
    const deleteModal = new bootstrap.Modal(
        document.getElementById('deleteModal'));
    const confirmButton = document.getElementById('confirmDeleteButton');

    confirmButton.removeEventListener('click', funClick);

    funClick = async function () {
        deleteModal.hide();
        await deleteOrder(orderId);
        await getOrders();
    };

    confirmButton.addEventListener('click', funClick);
    
    deleteModal.show();
}

loadRoutes();

document.getElementById('excursionDate').addEventListener(
    'change', calculateTotalCost);
document.getElementById('startHour').addEventListener(
    'change', calculateTotalCost);
document.getElementById('duration').addEventListener(
    'change', calculateTotalCost);
document.getElementById('groupSize').addEventListener(
    'input', calculateTotalCost);
document.getElementById('seniorDiscount').addEventListener(
    'change', calculateTotalCost);
document.getElementById('snackOption').addEventListener(
    'change', calculateTotalCost);
document.getElementById('seniorDiscount').addEventListener(
    'change', function() {
        calculateTotalCost();
    });
document.getElementById(
    'snackOption').addEventListener('change', function() {
    calculateTotalCost();
});
document.getElementById('submitButton').addEventListener('click', function() {
    changeOrder();
});