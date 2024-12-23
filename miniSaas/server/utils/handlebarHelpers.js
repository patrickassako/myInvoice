const handlebars = require('handlebars');

// Helper pour comparer des valeurs
handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Helper pour formater les dates
handlebars.registerHelper('formatDate', function(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Helper pour multiplier deux nombres
handlebars.registerHelper('multiply', function(a, b) {
  return (a * b).toFixed(2);
});

// Helper pour formater les montants
handlebars.registerHelper('formatMoney', function(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
});

module.exports = handlebars; 