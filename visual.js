

const printSpeed_ = 60;
const obj_textContent = {'header': 'install tmm player'}





function printContent(position, new_content = 'null', speed = printSpeed_, end_string = 0){

    const content = (new_content === 'null') ? obj_textContent[position] : new_content;
    const element_ = document.getElementById(position);
    element_.inneHtml = '';

    

    const printInterval_ = setInterval(() => {
        if(end_string < content.length) {
            element_.innerHTML += content[end_string];
            end_string ++;
        }else {
            clearInterval(printInterval_);
            return;
        }

    }, speed);

}


module.exports = { printContent }