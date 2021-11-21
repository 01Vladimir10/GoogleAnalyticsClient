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
        defaultLabel: '',
        onDateChange: (startDate, endDate) => {},
    }) {
        this.container = element;
        this.settings = settings;
        this.initializeElement();
    }
    
    onDateChange(callback) {
        this.settings.onDateChange = callback;
    }
    
    initializeElement() {
        this.startDate = this.container.querySelector('input[name="startDate"]');
        this.endDate = this.container.querySelector('input[name="endDate"]');
        this.button = this.container.querySelector('.date-range-picker__panel button');
        this.content = this.container.querySelector('.date-range-picker__content');
        
        this.startDate.value = this.settings.defaultStartDate;
        this.endDate.value = this.settings.defaultEndDate;
        
        this.content.innerText = this.settings.defaultLabel === '' ? this.getDateBasedLabel() : this.settings.defaultLabel;
        this.attachInputListeners();
    }
    
    getDateBasedLabel() {
        let formatter = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day:'2-digit'});
        let startDate = new Date(this.startDateValue);
        let endDate = new Date(this.endDateValue);
        return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
    }
    
    attachInputListeners() {
        this.startDate.addEventListener('change', () => {
            this.endDate.min = this.startDateValue;
        });
        this.endDate.addEventListener('change', () => {
            this.startDate.max = this.endDateValue;
        });
        this.button.addEventListener('click', async () => {
            let startDate = new Date(this.startDateValue);
            let endDate = new Date(this.endDateValue);
            this.content.innerText = this.getDateBasedLabel();
            this.container.classList.toggle('expanded');
            await this.settings.onDateChange(startDate, endDate);
        });
        this.content.addEventListener('click', () => {
            this.container.classList.toggle('expanded');
        })
    }
}