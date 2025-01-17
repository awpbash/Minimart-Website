// Success Toast
const successToast = (text) => Toastify({
    text: text,
    duration: 3000, // Duration in milliseconds
    close: true, // Show close button
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center`, or `right`
    backgroundColor: "#28a745", // Green for success
}).showToast();

// Error Toast
const errorToast = (text) => Toastify({
    text: text,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "#dc3545", // Red for error
}).showToast();