
const app = window.app || (() => {

    const modules = ["form"];
    const endpoint = "api/users";
    const container = "#user-list";

    const init = () => {
        console.log("App is up and running!");
        modules.forEach((module) => {
            if (app[module] && typeof app[module].init === "function") {
                app[module].init();
            }
        });

        getData();
    }

    const getData = () => {

        fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'hr-HR;q=0.9, en-US;q=0.8'
            }
        })
        .then(response => response.json())
        .then(data => app.table.populate(data, endpoint, container))
        .catch(error => console.error('Unable to get data.', error));
    }

    return {
        init
    }

})();


app.form = (() => {

    const init = () => {
        document.addEventListener('click', function (event) {
            if (event.target.name === "submit") {
                submit(event);
            }
        });

        document.addEventListener('click', function (event) {
            if (event.target.name === "cancel") {
                event.target.closest('form').classList.remove('form-visible');
            }
        });
    };

    const submit = (event) => {

        event.preventDefault();
        const form = event.target.closest('form');
        const formData = new FormData(form);
        const data = Object.fromEntries(Array.from(formData.entries()).filter(([key]) => key !== 'method'));

        console.log("DATA: ", data);

        const method = form.elements["method"].value;                   
        const action = form.action;

        fetch(action, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'hr-HR;q=0.9, en-US;q=0.8'
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
            method == "POST" ? app.table.insertItem(data, undefined, { highlight: true }) : app.table.updateItem(data);
            reset(form, true);
        })
        .catch(error => {
            if (error instanceof Response) {
                error.json().then(errorData => {
                    console.log("Received error data:", errorData);
                    validate(form, errorData.errors);
                }).catch(jsonError => {
                    console.error("Error in parsing server response:", jsonError);
                });
            } else {
                console.error("Network or other error:", error);
            }
        });
    };

    const show = (form, flag) => {
        //if (flag) reset(form);
        form.classList.add('form-visible');
    };

    const hide = (form) => {
        reset(form);
        form.classList.remove('form-visible');
    };

    const reset = (form, flag) => {
        Array.from(form.elements).forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.value = '';
            }
            element.disabled = flag;
        });
    }

    //const validate = (form, errors) => {
    //    for (var error in errors) {
    //        if (errors.hasOwnProperty(error)) {
    //            console.log(error + " - " + errors[error]);
    //            let element = (form[error] && form[error].length && form[error][0].tagName !== "SELECT") ? form[error][0] : form[error];
    //            let errorContainer = element.parentNode.querySelector(".error:first-of-type");
    //            if (errorContainer) {
    //                errorContainer.innerHTML = errors[error];
    //            } else {
    //                console.log(`Error container not found for ${error}`);
    //            }
    //        }
    //    }
    //}

    const validate = (form, errors) => {
        for (let error in errors) {
            if (errors.hasOwnProperty(error)) {
                const errorMessage = Array.isArray(errors[error]) ? errors[error].join(', ') : errors[error];
                console.log(`${error} - ${errorMessage}`);
                let element = (form[error] && form[error].length && form[error][0].tagName !== "SELECT") ? form[error][0] : form[error];
                let errorContainer = element.parentNode.querySelector(".error:first-of-type");
                if (errorContainer) {
                    errorContainer.innerHTML = errorMessage;
                } else {
                    console.log(`Error container not found for ${error}`);
                }
            }
        }
    }

    return {
        init,
        show,
        hide
    };

})();


app.table = (() => {

    var table;
    var url;
    var schema = {}; // Added on the last run. There is a better way for sure.

    const deleteItem = (itemId) => {

        const confirmDelete = confirm("Are you sure you want to delete this item?");

        if (confirmDelete) {
            fetch(url + '/' + itemId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': 'hr-HR;q=0.9, en-US;q=0.8'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    if (response.status === 204) {
                        console.log("Item deleted successfully.");
                        const row = table.querySelector(`tr[data-id="${itemId}"]`);
                        if (row) {
                            row.remove();
                        }
                        return null;
                    } else {
                        return response.json();
                    }
                })
                .then(data => {
                })
                .catch(error => {
                    console.error('Error during delete:', error);
                });
        }
    };

    const editItem = (itemId) => {

        fetch(url + '/' + itemId)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched data:", data);

                const form = document.querySelector('form[name="user-form"]');
                form.elements["method"].value = 'PUT';
                form.action = 'api/users/' + itemId;

                Object.keys(data).forEach(key => {
                    let pascalCaseKey = key.charAt(0).toUpperCase() + key.slice(1);

                    if (form.elements[pascalCaseKey]) {
                        form.elements[pascalCaseKey].value = data[key];
                    }
                });
                app.form.show(form);
            })
            .catch(error => {
                console.error('Error during edit:', error);
            });
    };

    const updateItem = (data) => {

        const row = table.querySelector(`tr[data-id="${data.id}"]`);

        if (row) {
            const cells = Array.from(row.querySelectorAll('td')).slice(1);
            Object.entries(data).forEach(([key, value], index) => {
                if (index === 0 || !cells[index - 1]) return;
                cells[index - 1].textContent = value;
            });
            row.classList.add('row-highlight');
            console.log("Item updated successfully.");
        } else {
            console.log("Item with the specified ID not found in the table.");
        }
    };

    const addItem = () => {

        const form = document.querySelector('form[name="user-form"]');
        form.elements["method"].value = 'POST';
        form.action = 'api/users';
        app.form.show(form, true);
    };

    const insertItem = (data, tbody, options = {}) => {

        tbody = tbody || table.querySelector('tbody');
        const newRow = document.createElement('tr');
        newRow.setAttribute("data-id", data.id);

        const actionCell = newRow.insertCell();
        const editLink = document.createElement('a');
        editLink.href = "#";
        editLink.textContent = "Edit";
        editLink.addEventListener('click', function () {
            editItem(data.id);
        });

        const deleteLink = document.createElement('a');
        deleteLink.href = "#";
        deleteLink.textContent = "Delete";
        deleteLink.addEventListener('click', function () {
            deleteItem(data.id);
        });

        actionCell.appendChild(editLink);
        actionCell.appendChild(document.createTextNode(" | "));
        actionCell.appendChild(deleteLink);

        Object.values(data).forEach((value, index) => {
            if (index === 0) return;
            const cell = newRow.insertCell();
            cell.textContent = value;

            // Too much effort just for right alignment
            if (['int', 'decimal', 'timestamp'].includes(schema[index].dataType.replace(/[^a-zA-Z0-9]/g, ''))) {
                cell.classList.add('align-right');
            }
        });

        tbody.appendChild(newRow);
        if (options.highlight) {
            newRow.classList.add('row-highlight');
        }
    };

    const header = (columns) => {

        const thead = table.createTHead();
        thead.innerHTML = '';

        const titleRow = thead.insertRow();
        const searchRow = thead.insertRow();

        columns.forEach(function (column, index) {
            var titleTh = document.createElement('th');
            var searchTh = document.createElement('th');

            var flexContainer = document.createElement('div');

            if (index === 0) {
                const add = document.createElement('a');
                add.href = '#';
                add.textContent = 'Add new';
                add.addEventListener('click', function (e) {
                    e.preventDefault();
                    addItem();
                });
                flexContainer.appendChild(add);
            } else {
                const columnName = document.createElement('span');
                columnName.textContent = column.name.replace(/([A-Z])/g, ' $1').trim();
                flexContainer.appendChild(columnName);

                if (column.isSortable) {
                    const sortingLinks = document.createElement('div');
                    ['asc', 'desc'].forEach(direction => {
                        const link = document.createElement('a');
                        link.href = `${url}?sortColumn=${column.name}&sortDirection=${direction}`;
                        link.innerHTML = direction === 'asc' ? '&darr;' : '&uarr;';
                        link.classList.add("sort-link", direction === 'asc' ? "sort-down" : "sort-up");
                        link.addEventListener('click', function (e) {
                            e.preventDefault();
                            fetch(this.getAttribute('href'))
                                .then(response => response.json())
                                .then(data => {
                                    app.table.populate(data, url, "#user-list");
                                })
                                .catch(error => console.error('Unable to get items.', error));

                        });
                        sortingLinks.appendChild(link);
                    });
                    flexContainer.appendChild(sortingLinks);
                }
            }

            titleTh.appendChild(flexContainer);
            titleRow.appendChild(titleTh);

            if (column.isSearchable && index !== 0) {
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Search ' + column.name;
                searchInput.oninput = (function (columnName) {
                    return function () {
                        const value = this.value;
                        const searchParams = new URLSearchParams(window.location.search);
                        searchParams.set(columnName, value);
                        const apiUrl = `/api/users?${searchParams.toString()}`;
                        fetch(apiUrl)
                            .then(response => response.json())
                            .then(data => {
                                app.table.populate(data, apiUrl, "#user-list");
                            })
                            .catch(error => console.error('Unable to fetch data.', error));
                    };
                })(column.name);
                searchTh.appendChild(searchInput);
            }
            searchRow.appendChild(searchTh);
        });
    };

    const body = (data) => {

        const tbody = table.querySelector('tbody') || table.createTBody();
        tbody.innerHTML = '';

        data.forEach(function (item) {
            insertItem(item, tbody);
        });
    };

    const footer = (pager) => {

        const
            tfoot = table.createTFoot(),
            row = tfoot.insertRow(),
            cell = row.insertCell();

        cell.colSpan = schema.length; // There must be a better way

        const footerContainer = document.createElement('div');
        const pageInfo = document.createElement('div');

        if (pager) {
            var start = (pager.currentPage - 1) * pager.pageSize + 1;
            var end = Math.min(pager.currentPage * pager.pageSize, pager.totalCount);
            pageInfo.textContent = start + ' to ' + end + ' of ' + pager.totalCount;
        } else {
            console.warn("No pager data found");
            pageInfo.textContent = "No data available";
        }

        const pagerContainer = document.createElement('div');
        app.pager(pagerContainer, pager, url);

        footerContainer.appendChild(pageInfo);
        footerContainer.appendChild(pagerContainer);

        cell.appendChild(footerContainer);
    };


    const populate = (payload, endpoint, target) => {

        console.log(payload);
        const tableContainer = document.querySelector(target);
        table = tableContainer.querySelector('table');
        const hasHeader = table && table.querySelector('thead');

        url = endpoint;
        schema = payload.columns;

        if (!table) {
            table = document.createElement('TABLE');
            tableContainer.appendChild(table);
        } else {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.remove();
            }
            var tfoot = table.querySelector('tfoot');
            if (tfoot) {
                tfoot.remove();
            }
        }

        if (!hasHeader) {
            if ('columns' in payload) {
                header(payload.columns);
            } else {
                // Case where columns are inferred and header doesn't exist
                const keys = Object.keys(payload.data[0]).map(key => ({ name: key, isSortable: true, isSearchable: true }));
                header(keys);
            }
        }

        if ('data' in payload && Array.isArray(payload.data) && payload.data.length > 0) {
            body(payload.data);
            footer(payload.pager);
        } else {
            console.error("Invalid payload data.");
            return;
        }
    };


    return {
        populate, insertItem, updateItem
    };
})();


app.pager =  (cell, pager, endpoint) => {
    const ul = document.createElement('ul');
    ul.classList.add('pager');

    const
        currentPage = pager.currentPage,
        totalPages = Math.ceil(pager.totalCount / pager.pageSize),
        pagesBefore = 5,
        pagesAfter = 5;

    for (let i = Math.max(1, currentPage - pagesBefore); i <= Math.min(totalPages, currentPage + pagesAfter); i++) {
        let li = document.createElement('li');
        li.classList.toggle('active', i === currentPage);

        if (i === currentPage) {
            li.textContent = i;
        } else {
            let link = document.createElement('a');
            link.href = `${endpoint}?pageNumber=${i}`;
            link.textContent = i;
            link.addEventListener('click', function (e) {
                e.preventDefault();
                fetch(this.getAttribute('href'))
                    .then(response => response.json())
                    .then(data => {
                        app.table.populate(data, endpoint, "#user-list");
                    })
                    .catch(error => console.error('Unable to get data.', error));
            });
            li.appendChild(link);
        }

        ul.appendChild(li);
    }

    cell.appendChild(ul);
};

// An attempt to create a generic wrapper on the Fetch API but left it for the next refactoring   
const ajaxRequest = (url, method, data, successCallback, errorCallback) => {
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'hr-HR;q=0.9, en-US;q=0.8'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(successCallback)
        .catch(errorCallback);
};

window.onload = app.init();
