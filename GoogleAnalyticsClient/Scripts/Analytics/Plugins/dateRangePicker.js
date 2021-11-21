class DateRangePicker {
    startDate;
    endDate;
    
    get startDateValue() {
        return this.startDate.value;
    }
    get endDateValue() {
        return this.endDate.value;
    }
    
    constructor(element, settings = {
        defaultStartDate: new Date(),
        defaultEndDate: new Date(),
        maxDays: null,
        defaultLabel: '',
        onDateChange: (_, __) => {},
    }) {
        this.container = element;
        this.settings = settings;
        this.insertHtml();
        this.initializeElement();
    }
    
    onDateChange(callback) {
        this.settings.onDateChange = callback;
    }
    
    get defaultLabelText() {
        if (this.settings.defaultLabel === '')
            return this.getDateBasedLabel();
        return this.settings.defaultLabel;
    }
    
    insertHtml() {
        this.container.classList.add('date-range-picker');
        this.container.innerHTML = `
            <div class="date-range-picker__content toggle">
                    ${this.defaultLabelText}
                </div>
                <div class="date-range-picker__panel">
                    <label>Desde</label>
                    <input type="date" name="startDate">
                    <label>Hasta</label>
                    <input type="date" name="endDate">
                    <button class="toggle">Aplicar</button>
                </div>
            </div>`;
    }
    
    
    static dateToInputDateFormat(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
    }
    
    
    initializeElement() {
        this.startDate = this.container.querySelector('input[name="startDate"]');
        this.endDate = this.container.querySelector('input[name="endDate"]');
        this.button = this.container.querySelector('.date-range-picker__panel button');
        this.content = this.container.querySelector('.date-range-picker__content');
        
        // Configure default values
        this.startDate.value = DateRangePicker.dateToInputDateFormat(this.settings.defaultStartDate);
        this.endDate.value = DateRangePicker.dateToInputDateFormat(this.settings.defaultEndDate);
        
        this.content.innerText = this.settings.defaultLabel === '' ? this.getDateBasedLabel() : this.settings.defaultLabel;
        this.attachListeners();
    }
    
    getDateBasedLabel() {
        let formatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day:'2-digit'});
        let startDate = new Date(this.startDateValue);
        let endDate = new Date(this.endDateValue);
        return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
    }
    
    validateMaxDays() {
        if (!this.settings.maxDays)
            return true;
        let startDate = new Date(this.startDateValue);
        let endDate = new Date(this.endDateValue);
        return (endDate.getDate() - startDate.getDate()) < this.settings.maxDays;
    }
    
    onStartDateChanged() {
        this.endDate.min = this.startDateValue;
        if (!this.validateMaxDays()) {
            alert(`No se puede seleccionar mas de ${this.settings.maxDays} dias`);
            let end = new Date(this.endDateValue);
            let date = new Date();
            date.setDate(end.getDate() - this.settings.maxDays);
            this.endDate.value = date;
        }
    }
    onEndDateChanged() {
        this.startDate.max = this.endDateValue;
        if (!this.validateMaxDays()) {
            alert(`No se puede seleccionar mas de ${this.settings.maxDays} dias`);
            let start = new Date(this.startDateValue);
            let date = new Date();
            date.setDate(start.getDate() + this.settings.maxDays);
            this.endDate.value = date;
        }
    }
    
    attachListeners() {
        this.startDate.addEventListener('change', this.onStartDateChanged.bind(this));
        this.endDate.addEventListener('change', this.onEndDateChanged.bind(this));
        
        // Configure apply button
        this.button.addEventListener('click', async () => {
            let startDate = new Date(this.startDateValue);
            let endDate = new Date(this.endDateValue);
            this.content.innerText = this.getDateBasedLabel();
            await this.settings.onDateChange(startDate, endDate);
        });
        // Configure toggles
        this.container.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                this.container.classList.toggle('expanded');
            });
        });
    }
}