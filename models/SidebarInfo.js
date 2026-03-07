const mongoose = require('mongoose');

const sidebarSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    birthday: { type: String, required: true },
    location: { type: String, required: true },
    socials: {
        twitter: { type: String, default: '#' },
        leetcode: { type: String, default: '#' },
        github: { type: String, default: '#' },
        linkedin: { type: String, default: '#' }
    }
});

module.exports = mongoose.model('SidebarInfo', sidebarSchema);
