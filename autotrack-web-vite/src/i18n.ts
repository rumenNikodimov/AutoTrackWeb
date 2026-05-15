
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        vehicles: "My Vehicles",
        dashboard: "Dashboard",
        addFuel: "Add fuel",
        fuelLog: "Fuel log",
        edit: "Edit",
        delete: "Delete",
        loading: "Loading...",
        noVehicles: "No vehicles found.",
        logout: "Logout",
        addVehicle: "Add Vehicle",
        deleteVehicleConfirm:
        "Delete this vehicle? This will hide it but keep all fuel history.",
        register: "Register",
        registering: "Registering...",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        allFieldsRequired: "All fields are required",
        passwordsNotMatch: "Passwords do not match",
        registerFailed: "Registration failed",
        alreadyHaveAccount: "Already have an account?",
        login: "Login",
        loggingIn: "Logging in...",
        emailPlaceholder: "test@mail.com",
        noAccount : "Don't have an account?",     
        cost: "Cost",
        fuel: "Fuel",
        avg: "Avg",
        entries: "Entries",
        highConsumption: "High fuel consumption!",
        fuelUsage: "Fuel Usage",
        consumption: "Consumption (L/100km)",
        currency: "EUR",
        
        editVehicle: "Edit Vehicle",
        brand: "Brand",
        model: "Model",
        fuelType: "Fuel Type",
        chooseFuel: "Choose fuel",
        gasoline: "Gasoline",
        diesel: "Diesel",
        hybrid: "Hybrid",
        electric: "Electric",
        licensePlate: "License Plate",
        productionYear: "Production Year",
        engineVolume: "Engine Volume (L)",
        vinOptional: "VIN (optional)",
        saveChanges: "Save Changes",
        cancel: "Cancel",

        fillFields: "Please fill all required fields",
        vinLength: "VIN must be exactly 17 characters",
        updateFailed: "Failed to update",
        loadVehicleError: "Failed to load vehicle",
        deleteEntry: "Delete this entry?",
        fuelEntries: "Fuel Entries",
        
        editEntry: "Edit Entry",
        energyType: "Energy Type",
        odometer: "Odometer (km)",
        fuelAmount: "Fuel (liters)",
        energy: "Energy (kWh)",
        fuelPrice: "Fuel price",
        electricPrice: "Electricity price",
        pricePerUnit: "Price per unit",
        save: "Save",
        loadFuelError: "Failed to load fuel entry"

      }
    },
    bg: {
      translation: {
        vehicles: "Моите коли",
        dashboard: "Табло",
        addFuel: "Добави гориво",
        fuelLog: "Зареждания",
        edit: "Редактирай",
        delete: "Изтрий",
        loading: "Зареждане...",
        noVehicles: "Няма добавени коли.",
        logout: "Изход",
        addVehicle: "Добави автомобил",
        deleteVehicleConfirm:
            "Да се изтрие ли автомобилът? Историята ще се запази.", 
        register: "Регистрация",
        registering: "Регистриране...",
        email: "Имейл",
        password: "Парола",
        confirmPassword: "Потвърди парола",
        allFieldsRequired: "Всички полета са задължителни",
        passwordsNotMatch: "Паролите не съвпадат",
        registerFailed: "Грешка при регистрация",
        alreadyHaveAccount: "Вече имаш акаунт?",
        login: "Вход",
        loggingIn: "Влизане...",
        emailPlaceholder: "test@mail.com",
        noAccount : "Нямаш акаунт?",
        cost: "Разход",
        fuel: "Гориво",
        avg: "Средно",
        entries: "Записи",
        highConsumption: "Висок разход!",
        fuelUsage: "Разход на гориво",
        consumption: "Среден разход (L/100km)",
        currency: "EUR",
        
        editVehicle: "Редакция на автомобил",
        brand: "Марка",
        model: "Модел",
        fuelType: "Тип гориво",
        chooseFuel: "Избери гориво",
        gasoline: "Бензин",
        diesel: "Дизел",
        hybrid: "Хибрид",
        electric: "Електрически",
        licensePlate: "Регистрационен номер",
        productionYear: "Година",
        engineVolume: "Обем (L)",
        vinOptional: "VIN (по избор)",
        saveChanges: "Запази промените",
        cancel: "Отказ",

        fillFields: "Попълни всички задължителни полета",
        vinLength: "VIN трябва да е точно 17 символа",
        updateFailed: "Грешка при обновяване",
        loadVehicleError: "Грешка при зареждане на автомобила",
        deleteEntry: "Да се изтрие ли записът?",
        fuelEntries: "Записи на гориво",
        
        editEntry: "Редакция на запис",
        energyType: "Тип енергия",
        odometer: "Километри",
        fuelAmount: "Гориво (литри)",
        energy: "Енергия (kWh)",
        fuelPrice: "Цена на гориво",
        electricPrice: "Цена на ток",
        pricePerUnit: "Цена за единица",
        save: "Запази",
        loadFuelError: "Грешка при зареждане"

      }
    }
  },

  lng: "en", // default
  fallbackLng: "en",

  interpolation: {
    escapeValue: false
  }
});

export default i18n;
