const categories = require('../models/Categories');

exports.getBlogs = (req, res) => {
    res.render('home');
    // res.send("main blog route")
}

exports.GetPostForm = (req,res)=>{
    res.render('post-blog')
}

exports.PutCategories = (req, res )=>{
    const lawCategories = [
        'Criminal Law',
        'Family Law',
        'Personal Injury',
        'Immigration Law',
        'Real Estate Law',
        'Intellectual Property Law',
        'Employment Law',
        'Business Law',
        'Bankruptcy Law',
        'Tax Law'
    ]
        for (const category of lawCategories) {
            const existingCategory =  categories.findOne({ where: { name: category } }).then((existingCategory)=>{
                if (!existingCategory){
                    categories.create({ name: category });
                } 
                 
            }).then(()=>{console.log("categories added")})
            
    }}
