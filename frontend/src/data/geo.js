const COUNTRIES = ["Bangladesh"];
const DIVISIONS = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Narsingdi",
    "Munshiganj",
    "Manikganj",
    "Kishoreganj",
    "Faridpur",
    "Gopalganj",
    "Madaripur",
    "Shariatpur",
    "Rajbari"
  ],
  Chattogram: [
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Brahmanbaria",
    "Chandpur",
    "Noakhali",
    "Lakshmipur",
    "Khagrachhari",
    "Rangamati",
    "Bandarban"
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rajshahi: [
    "Rajshahi",
    "Bogura",
    "Pabna",
    "Sirajganj",
    "Natore",
    "Naogaon",
    "Joypurhat",
    "Chapainawabganj"
  ],
  Khulna: [
    "Khulna",
    "Jashore",
    "Satkhira",
    "Bagerhat",
    "Kushtia",
    "Chuadanga",
    "Meherpur",
    "Narail",
    "Magura",
    "Jhenaidah"
  ],
  Barishal: [
    "Barishal",
    "Bhola",
    "Patuakhali",
    "Pirojpur",
    "Barguna",
    "Jhalokati"
  ],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Kurigram",
    "Gaibandha",
    "Nilphamari",
    "Lalmonirhat",
    "Panchagarh",
    "Thakurgaon"
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
};
const DIVISION_NAMES = Object.keys(DIVISIONS);
const districtsFor = (division) => DIVISIONS[division] || [];
const ADDRESS_LABELS = ["Home", "Office", "Other"];
export {
  ADDRESS_LABELS,
  COUNTRIES,
  DIVISIONS,
  DIVISION_NAMES,
  districtsFor
};
