const GREEN = '\033[0;32m';
const RED = '\033[0;31m';
const NC = '\033[0m';

module.exports = (color) => {
    const currentDate = new Date();
    let hh = currentDate.getHours();
    let mm = currentDate.getMinutes();
    let ss = currentDate.getSeconds();

    if (hh < 10)
        hh = `0${hh}`;

    if (mm < 10)
        mm = `0${mm}`;

    if (ss < 10)
        ss = `0${ss}`;

    return `${color || GREEN}${hh}:${mm}:${ss}${NC}`;
}