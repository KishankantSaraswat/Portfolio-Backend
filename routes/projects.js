const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/projects
// @desc    Create a project
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
    const {
        title, category, image, shortDescription, fullSummary,
        problemStatement, solution, systemArchitecture, architectureImage, techStack,
        keyFeatures, challengesLearning, resultsImpact, demoLinks,
        isFeatured, tags
    } = req.body;

    try {
        const count = await Project.countDocuments();
        const newProject = new Project({
            title, category, image, shortDescription, fullSummary,
            problemStatement, solution, systemArchitecture, architectureImage, techStack,
            keyFeatures, challengesLearning, resultsImpact, demoLinks,
            isFeatured, tags,
            order: count
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/projects/reorder
// @desc    Update projects order
// @access  Private (Admin only)
router.put('/reorder', auth, async (req, res) => {
    const { projects } = req.body; // Array of { _id, order }

    try {
        const updatePromises = projects.map(p =>
            Project.findByIdAndUpdate(p._id, { order: p.order })
        );
        await Promise.all(updatePromises);
        res.json({ msg: 'Order updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
    const {
        title, category, image, shortDescription, fullSummary,
        problemStatement, solution, systemArchitecture, architectureImage, techStack,
        keyFeatures, challengesLearning, resultsImpact, demoLinks,
        isFeatured, tags
    } = req.body;

    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title, category, image, shortDescription, fullSummary,
                    problemStatement, solution, systemArchitecture, architectureImage, techStack,
                    keyFeatures, challengesLearning, resultsImpact, demoLinks,
                    isFeatured, tags
                }
            },
            { new: true }
        );

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        await Project.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
