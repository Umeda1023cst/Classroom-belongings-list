// 今日の持ち物リストを表示する関数
const displayTodayItems = () => {
    const content = document.querySelector('div.content');
    const todayItemsElement = document.getElementById('today-items');
    const today = new Date().toLocaleDateString('en-EN', { weekday: 'long' });
    console.log(today);
    fetch('./json/setting.json')
        .then((response) => response.json())
        .then((settings) => {
            const items = settings.items_list[today];
            console.log(items);
            if (!(settings.items_list[today].length > 0)) {
                todayItemsElement.innerHTML = '';
                const p = document.createElement('p');
                p.textContent = 'No need items today!';
                todayItemsElement.appendChild(p);
            } else {
                items.forEach((item) => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    todayItemsElement.appendChild(li);
                });
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

document.addEventListener('DOMContentLoaded', displayTodayItems);

