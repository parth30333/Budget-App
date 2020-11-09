// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            // id has to be unique to identify different Income or Expense object.
            //[1 2 3 4 5], next id(must be) = 6
            //[1 2 4 6 8], nextid(must be) = 9
            //id = last id +  1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;   // Since, there will be lots of objects in 'inc' or ''exp' array  
                // and out of those objects we want the last object, and out of that last object, we want to access only the id of that object. 
            } else {
                ID = 0;   /* we have applied if else for ID, cause in the start the 'inc' or 'exp' array will be empty and this-: 
                data.allItems[type][data.allItems[type].length - 1]  will give index  = -1, which is not possible for an array */
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push the newItem in to our Data Structue
            data.allItems[type].push(newItem);
            
            // Return the newItem   
            return newItem;
        },

        deleteItem: function(type, id) {
           var ids, index;
           
           ids = data.allItems[type].map(function(current) {   // will return a new array with the same length but with value passed in map(), in this value is , value returned by the function passed in map function.
                return current.id;
            });
            index = ids.indexOf(id);
            if( index !== -1) {
                data.allItems[type].splice(index, 1); 
            }
        },

        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            //    if else is applied cause-: if the 'income is 0' & expense is entered than 'percentage will become infinity'.
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }    
           
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
               return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function() {   //this is to return the budget(total inc, total exp, budget, percentage of income spend) 
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
  };

})();


var UIcontroller = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',                  // all these strings are defined in this object, cause if name of any classes in HTML 
        inputDescription: '.add__description',    // changes than instead of changing the name of classes everywhere in the code , we
        inputValue: '.add__value',                // can  just change the name in DOMstrings object.
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        totalBudgetLabel: '.budget__value',
        totalIncLabel:  '.budget__income--value',
        totalExpLabel:   '.budget__expenses--value',
        percentageLabel:  '.budget__expenses--percentage',
        container:  '.container',
        expensePercentageLabel:  '.item__percentage',
        monthLabel:  '.budget__title--month'
       };

       var formatNumber = function(num, type) {
           var numSplit, int, dec;
        // 1. '+' or '-' sign
        // 2. exactly 2 decimals points 
        // 3. ',' after every thousand.

        num = Math.abs(num);  // Math.abs() is used to give a absolute value 'or' it removes the '+' & '-' sign.
        num = num.toFixed(2); // num.toFixed(2) is used put decimal values upto 2(number passed in method).
        
        numSplit = num.split('.'); // will return strings splited around '.' 
        int = numSplit[0];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' '  + int + '.' + dec; 
       };

       var nodeListforEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };  // we have defined this customised(built to use for data structure than arrays) forEach loop here, so that it can be accessed by every retured object in UIcontroller.


   // returned object without any name , which have two methods(getInput() and getDOMstrings()), and this object can be accessed from public scope.       

    return {    
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },   // ',' is because the object is returning another method , which is for accessing the 'DOMstrings variable' as it was declared in private scope.
         
        addListItem: function(obj, type) {  // here obj = newItem
            var html , newHtml, element;
            // Create HTML string with placeholder text

            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html ='<div class="item clearfix" id="inc-%id%">'+'<div class="item__description">%description%</div>'+'<div class="right clearfix">'+
                      '<div class="item__value">%value%</div>'+'<div class="item__delete">'+'<button class="item__delete--btn">'+
                      '<i class="ion-ios-close-outline"></i>'+'</button>'+'</div>'+'</div>'+
                      '</div>';
            } else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html =  '<div class="item clearfix" id="exp-%id%">'+'<div class="item__description">%description%</div>'+'<div class="right clearfix">'+
                        '<div class="item__value">%value%</div>'+'<div class="item__percentage">21%</div>'+'<div class="item__delete">'+
                        '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+'</div>'+'</div>'+
                        '</div>';
            }

            // Replace the placeholder text(HTML code string) with actual data.
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML(actual data) code into DOM.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        }, 

        deleteListItem: function(selectorID) {
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);                // el = element wanted , el.parentNode = first grabing the parent than removing child = el
        },

        // if input fields are not cleared after adding one new item, than if enter is pressed the same item gets added to the UI.
        
        clearInputFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);  // here ',' operator is used to seperate the two things, which are to be selected.

            // Converting a List to an array.
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {   // we pass a callback function in 'forEach method'  like in addEventListeners(). 
                current.value = "";  // here 'value in current.value' is the value of the element of the array and it gets to empty after each iteration.
            }); 

// NOTE-: converting the array-like aobject(list) to an array will be more benefitial when more items were selected by the querySelectorAll() method and we can loop 
//        over those items and were also be able to apply all the array methods on those selected items.

            fieldsArr[0].focus();  //  to set the focus again on the first field(description) after clearing all fields
        },

        displayBudget: function(obj) {   
            var type;
            type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.totalBudgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.totalIncLabel).textContent =  formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.totalExpLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "----";
            }
        },

        displayPercentage: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);
          
            nodeListforEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'; // percentages[index]-: cause the percentages passed in displayPercentage function is the
                                                                    // array returned in getPercentages function in budgetController. 
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var currentDate, month, year, months;
            currentDate = new Date();

            month = currentDate.getMonth();
            year = currentDate.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novomber', 'December'];

            document.querySelector(DOMstrings.monthLabel).textContent = months[month]  + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                            DOMstrings.inputType + ',' +
                            DOMstrings.inputDescription + ',' +
                            DOMstrings.inputValue);
            
            // Since we have more than one DOM elements in fields variable, to change anything in those DOM elements we have to loop over the fields variable.
           
            nodeListforEach(fields, function(cur) {  // to change the color of input fields
                cur.classList.toggle('red-focus');
            });
            
            // NOTE-: don't use '.' with class name in classList.toggle()
 
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); // to change the color of button.
        },

    getDOMstrings: function() {
        return DOMstrings;
    }
  };

})();


// new module to connect the input data in UIcontroller & updation and storing of new items objects.(incomes and expenses)

var controller = (function(budgetCtrl,UICtrl) {
//setUpEventListeners(); here, this call  will give an error, cause setUpEventListeners() is a function expression and it will not perform hoisting.

    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event) {

         //    console.log(event); // to check what this event object has and passed automatically by the browser.
         if(event.keyCode === 13 || event.which === 13) {
           ctrlAddItem();
         }     
      });
      
      document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. calculate the Budget.
           budgetController.calculateBudget();

        // 2. return Budget.
           var budget  = budgetController.getBudget();

        // 3. Display the Budget on UI.
           UICtrl.displayBudget(budget);
    };

    var upadatepercentage = function() {
        // 1. calculate the percentage 
           budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budgetController.
          var allPercentages = budgetCtrl.getPercentages();

        // 3. upadate the new percentages on UI.
           UICtrl.displayPercentage(allPercentages);
    };

    var ctrlAddItem = function() {  // this function is defined to follow 'DRY' principle as the same functionality is used in both 'click' & 'Keypress' events
    var input, newItem;

    // 1.  Get the field input data
       input = UICtrl.getInput();

       if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        // 2.  Add the item to the budgetapp controller 
        newItem = budgetController.addItem(input.type, input.description, input.value);

        // 3.  Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

        // 4. Clear the Input Fields.
            UICtrl.clearInputFields();

        // 5.  Calculate the budget and update the UI.
            updateBudget();

        // 6. calculate and upadte the percentages on UI.
            upadatepercentage();    
       }
   };

   var ctrlDeleteItem = function(event) {   // here ctrlDeleteItem() is the callback function(event handler) in the event listener method to delete item and it has
                                            // access to the event object.
        var itemID, splitID, type, ID;
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if(itemID) {
            splitID = itemID.split('-'); // it splits up the string along '-' and returns an array conatining splited parts of the string
            type = splitID[0];
            ID = parseInt(splitID[1]);  // cause split method on a string returns a string.

            // 1. delete the item inside data structure.
               budgetCtrl.deleteItem(type, ID);

            // 2. delete the item on UI.
               UICtrl.deleteListItem(itemID);
            
            // 3. recalculate the budget and display it on UI.
                updateBudget();

            // 4. calculate and upadte the percentages on UI.
            upadatepercentage();    
        }
   };

   return {
    init:  function() {
        console.log('Application has started');
        UICtrl.displayMonth();
        UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
        setUpEventListeners();  
    }
   };

})(budgetController,UIcontroller);
controller.init();