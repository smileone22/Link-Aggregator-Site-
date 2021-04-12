const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, unique: true, required: true}
});

const ArticleSchema = new mongoose.Schema({
    title: {type: String, required: true},
    url: {type: String, required: true},
    description: String,
    addedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'UserSchema'}
});
ArticleSchema.plugin(URLSlugs('title')) //use mongoose-url-slugs to add a slug to uniquely identify each article
mongoose.model('User', UserSchema);
mongoose.model('Article', ArticleSchema);
mongoose.connect('mongodb://localhost/hw06', {useNewUrlParser: true, useUnifiedTopology: true});
