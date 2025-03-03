const { Blogs, Users } = require('../models');
const Categories = require('../models/Categories'); 

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blogs.findAll({
      include: [{ model: Users, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.render('blog/index', { 
      title: 'Home',
      blogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get blog creation form
exports.getCreateForm = (req, res) => {
  res.render('blog/create', { title: 'Create Post' });
};

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, image } = req.body;

    await Blogs.create({
      title,
      content,
      image,
      userId: req.session.user_id
    });

    res.redirect('/blog');
  } catch (error) {
    console.error(error);
    res.render('blog/create', { 
      title: 'Create Post',
      error: 'Failed to create post'
    });
  }
};

// Get single blog post
exports.getSingleBlog = async (req, res) => {
  try {
    const blog = await Blogs.findByPk(req.params.id, {
      include: [{ model: Users, attributes: ['name', 'email'] }]
    });

    if (!blog) {
      return res.status(404).send('Post not found');
    }

    res.render('blog/show', { 
      title: blog.title,
      blog
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get edit form
exports.getEditForm = async (req, res) => {
  try {
    const blog = await Blogs.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).send('Post not found');
    }

    if (blog.userId !== req.session.user_id) {
      return res.status(403).send('Unauthorized');
    }

    res.render('blog/edit', { 
      title: 'Edit Post',
      blog
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update blog post
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blogs.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).send('Post not found');
    }

    if (blog.userId !== req.session.user_id) {
      return res.status(403).send('Unauthorized');
    }

    const { title, content, image } = req.body;

    await blog.update({
      title,
      content,
      image
    });

    res.redirect(`/blog/${blog.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete blog post
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blogs.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).send('Post not found');
    }

    if (blog.userId !== req.session.user_id) {
      return res.status(403).send('Unauthorized');
    }

    await blog.destroy();

    res.redirect('/blog');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Populate categories
exports.populateCategories = async (req, res) => {
  try {
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
    ];

    for (const category of lawCategories) {
      const existingCategory = await Categories.findOne({ where: { name: category } });
      if (!existingCategory) {
        await Categories.create({ name: category });
      }
    }

    console.log("Categories added successfully");
    res.send("Categories populated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to populate categories');
  }
};
