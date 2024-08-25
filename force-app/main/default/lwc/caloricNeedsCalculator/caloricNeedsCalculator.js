import { LightningElement, track } from 'lwc';
import saveUserRecord from '@salesforce/apex/CaloricNeedsController.saveUserRecord';

class BMRCalculator {
    constructor(weight, height, age, gender) {
        this.weight = weight;
        this.height = height;
        this.age = age;
        this.gender = gender;
    }

    calculateBMR() {
        return this.gender === 'Male'
            ? 66.47 + (13.75 * this.weight) + (5.003 * this.height) - (6.755 * this.age)
            : 655.1 + (9.563 * this.weight) + (1.850 * this.height) - (4.676 * this.age);
    }
}

class ActivityLevelCalculator extends BMRCalculator {
    constructor(weight, height, age, gender, activityLevel) {
        super(weight, height, age, gender);
        this.activityLevel = activityLevel;
    }

    getMultiplier() {
        const multipliers = {
            'Sedentary': 1.2,
            'Lightly active': 1.375,
            'Moderately active': 1.55,
            'Active': 1.725,
            'Very active': 1.9,
        };
        return multipliers[this.activityLevel] || 1.2;
    }

    calculateDailyCalories() {
        return (this.calculateBMR() * this.getMultiplier()).toFixed(2);
    }
}

export default class CaloricNeedsCalculator extends LightningElement {
    @track name = '';
    @track gender = '';
    @track age = '';
    @track height = '';
    @track weight = '';
    @track activityLevel = '';
    @track goal = '';
    @track caloricNeeds = '';

    get genderOptions() {
        return [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
        ];
    }

    get activityLevels() {
        return [
            { label: 'Sedentary', value: 'Sedentary' },
            { label: 'Lightly active', value: 'Lightly active' },
            { label: 'Moderately active', value: 'Moderately active' },
            { label: 'Active', value: 'Active' },
            { label: 'Very active', value: 'Very active' }
        ];
    }

    get goalOptions() {
        return [
            { label: 'Weight gain', value: 'Weight gain' },
            { label: 'Weight loss', value: 'Weight loss' },
            { label: 'Maintain weight and gain muscle', value: 'Maintain weight and gain muscle' }
        ];
    }

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleGenderChange(event) {
        this.gender = event.target.value;
    }

    handleAgeChange(event) {
        this.age = parseInt(event.target.value, 10);
    }

    handleHeightChange(event) {
        this.height = parseInt(event.target.value, 10);
    }

    handleWeightChange(event) {
        this.weight = parseInt(event.target.value, 10);
    }

    handleActivityLevelChange(event) {
        this.activityLevel = event.target.value;
    }

    handleGoalChange(event) {
        this.goal = event.target.value;
    }

    validateInputs() {
        return this.name && this.gender && this.age && this.height && this.weight && this.activityLevel && this.goal;
    }

    calculateCalories() {
        if (!this.validateInputs()) {
            alert('Please fill in all fields.');
            return;
        }

        const calculator = new ActivityLevelCalculator(
            this.weight,
            this.height,
            this.age,
            this.gender,
            this.activityLevel
        );

        this.caloricNeeds = calculator.calculateDailyCalories();
        
        saveUserRecord({ 
            name: this.name,
            gender: this.gender,
            age: this.age,
            height: this.height,
            weight: this.weight,
            activityLevel: this.activityLevel,
            goal: this.goal,
            caloricNeeds: this.caloricNeeds
        })

        .then( () => console.log('Record saved successfully'))
        .catch(error => console.error('Error saving record:', error));
    }
}
