
const saveSettings = async () => {
    const address = document.querySelector('input#email');
    if (address.value === '') {
        alert("No Gmail Address has been entered.")
        return;
    }
    const form = document.getElementById('settingsForm');
    const formData = new FormData(form);
    const settings = Object.fromEntries(formData.entries());
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
    })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            alert('データが保存されました。');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('エラーが発生しました。');
        });
};

document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.querySelector('button');
    saveButton.addEventListener('click', saveSettings);
});
