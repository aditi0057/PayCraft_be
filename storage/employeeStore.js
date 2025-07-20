let employees=[];

const setEmployees = (data) =>{
    employees=data;
}
const getEmployees = ()=>{
    return employees;
}
module.exports = {
    setEmployees,
    getEmployees
};