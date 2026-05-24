import Job from "../models/job.js";
import asyncHandler from "../middleware/asyncHandler.js";

// ────────────────────────────────────────
// POST /api/jobs
// ────────────────────────────────────────
export const createJob = asyncHandler(async (req, res) => {
    const { title, company, role, location, salary, description, status, appliedDate, notes } = req.body;

    if (!title || !company) {
        res.status(400);
        throw new Error("Title and Company are required");
    }

    const job = await Job.create({
        user: req.user._id,
        title,
        company,
        role: role || "",
        location: location || "",
        salary: salary || "",
        description: description || "",
        status: status || "Saved",
        appliedDate: appliedDate || null,
        notes: notes || "",
    });

    res.status(201).json({ success: true, data: job });
});

// ────────────────────────────────────────
// GET /api/jobs
// Supports ?status=Applied&search=google&sort=-createdAt
// ────────────────────────────────────────
export const getJobs = asyncHandler(async (req, res) => {
    const query = { user: req.user._id };

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search by title or company
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, "i");
        query.$or = [{ title: searchRegex }, { company: searchRegex }];
    }

    // Sort (default: newest first)
    const sort = req.query.sort || "-createdAt";

    const jobs = await Job.find(query).sort(sort);

    res.json({ success: true, count: jobs.length, data: jobs });
});

// ────────────────────────────────────────
// GET /api/jobs/stats
// ────────────────────────────────────────
export const getJobStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [stats] = await Job.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                applied: { $sum: { $cond: [{ $eq: ["$status", "Applied"] }, 1, 0] } },
                interview: { $sum: { $cond: [{ $eq: ["$status", "Interview"] }, 1, 0] } },
                offer: { $sum: { $cond: [{ $eq: ["$status", "Offer"] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
                saved: { $sum: { $cond: [{ $eq: ["$status", "Saved"] }, 1, 0] } },
            },
        },
    ]);

    const defaultStats = {
        total: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        saved: 0,
    };

    const result = stats || defaultStats;

    // Calculate rates
    const successRate = result.total > 0
        ? Math.round((result.offer / result.total) * 100)
        : 0;
    const interviewRate = result.total > 0
        ? Math.round((result.interview / result.total) * 100)
        : 0;

    res.json({
        success: true,
        data: {
            ...result,
            _id: undefined,
            successRate,
            interviewRate,
        },
    });
});

// ────────────────────────────────────────
// GET /api/jobs/:id
// ────────────────────────────────────────
export const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
        res.status(404);
        throw new Error("Job not found");
    }

    res.json({ success: true, data: job });
});

// ────────────────────────────────────────
// PUT /api/jobs/:id
// ────────────────────────────────────────
export const updateJob = asyncHandler(async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
        res.status(404);
        throw new Error("Job not found");
    }

    // Only update provided fields
    const allowedFields = ["title", "company", "role", "location", "salary", "description", "status", "appliedDate", "notes"];
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            job[field] = req.body[field];
        }
    });

    const updatedJob = await job.save();
    res.json({ success: true, data: updatedJob });
});

// ────────────────────────────────────────
// DELETE /api/jobs/:id
// ────────────────────────────────────────
export const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });

    if (!job) {
        res.status(404);
        throw new Error("Job not found");
    }

    await job.deleteOne();
    res.json({ success: true, message: "Job removed" });
});

// ────────────────────────────────────────
// GET /api/jobs/weekly-stats
// Returns daily application counts for last 8 weeks
// ────────────────────────────────────────
export const getWeeklyStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const weeks = 8;
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const raw = await Job.aggregate([
        { $match: { user: userId, createdAt: { $gte: since } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    week: { $isoWeek: "$createdAt" },
                },
                count: { $sum: 1 },
                applied: { $sum: { $cond: [{ $eq: ["$status", "Applied"] }, 1, 0] } },
                interview: { $sum: { $cond: [{ $eq: ["$status", "Interview"] }, 1, 0] } },
                offer: { $sum: { $cond: [{ $eq: ["$status", "Offer"] }, 1, 0] } },
            },
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    // Build full 8-week labels even if some weeks are empty
    const result = [];
    for (let i = weeks - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        const year = d.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        const label = `W${week}`;
        const found = raw.find((r) => r._id.year === year && r._id.week === week);
        result.push({
            label,
            count: found?.count || 0,
            applied: found?.applied || 0,
            interview: found?.interview || 0,
            offer: found?.offer || 0,
        });
    }

    res.json({ success: true, data: result });
});

// ────────────────────────────────────────
// GET /api/jobs/salary-analytics
// Returns salary insights from job data
// ────────────────────────────────────────
export const getSalaryAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const jobs = await Job.find({ user: userId });

    // Parse salary strings to numbers (handles "$80k", "80,000", "$80,000-$100,000", etc.)
    function parseSalary(salaryStr) {
        if (!salaryStr) return null;
        const cleaned = salaryStr.replace(/[^0-9.\-–kK]/g, "");
        if (!cleaned) return null;

        // Handle range (take average)
        const parts = cleaned.split(/[-–]/);
        const values = parts.map((p) => {
            let num = parseFloat(p);
            if (isNaN(num)) return null;
            if (/k/i.test(salaryStr) && num < 1000) num *= 1000;
            return num;
        }).filter(Boolean);

        if (values.length === 0) return null;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    const jobsWithSalary = jobs
        .map((j) => ({ ...j.toObject(), parsedSalary: parseSalary(j.salary) }))
        .filter((j) => j.parsedSalary !== null);

    if (jobsWithSalary.length === 0) {
        return res.json({
            success: true,
            data: {
                totalWithSalary: 0,
                totalWithout: jobs.length,
                average: 0,
                median: 0,
                min: 0,
                max: 0,
                byStatus: [],
                byCompany: [],
                distribution: [],
            },
        });
    }

    const salaries = jobsWithSalary.map((j) => j.parsedSalary).sort((a, b) => a - b);
    const sum = salaries.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / salaries.length);
    const median = salaries.length % 2 === 0
        ? Math.round((salaries[salaries.length / 2 - 1] + salaries[salaries.length / 2]) / 2)
        : Math.round(salaries[Math.floor(salaries.length / 2)]);
    const min = Math.round(salaries[0]);
    const max = Math.round(salaries[salaries.length - 1]);

    // By status
    const statusMap = {};
    jobsWithSalary.forEach((j) => {
        if (!statusMap[j.status]) statusMap[j.status] = [];
        statusMap[j.status].push(j.parsedSalary);
    });
    const byStatus = Object.entries(statusMap).map(([status, sals]) => ({
        status,
        count: sals.length,
        average: Math.round(sals.reduce((a, b) => a + b, 0) / sals.length),
        min: Math.round(Math.min(...sals)),
        max: Math.round(Math.max(...sals)),
    }));

    // By company (top 10)
    const companyMap = {};
    jobsWithSalary.forEach((j) => {
        if (!companyMap[j.company]) companyMap[j.company] = [];
        companyMap[j.company].push(j.parsedSalary);
    });
    const byCompany = Object.entries(companyMap)
        .map(([company, sals]) => ({
            company,
            count: sals.length,
            average: Math.round(sals.reduce((a, b) => a + b, 0) / sals.length),
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

    // Salary distribution (brackets)
    const brackets = [
        { label: "< $30k", min: 0, max: 30000 },
        { label: "$30k-$50k", min: 30000, max: 50000 },
        { label: "$50k-$75k", min: 50000, max: 75000 },
        { label: "$75k-$100k", min: 75000, max: 100000 },
        { label: "$100k-$150k", min: 100000, max: 150000 },
        { label: "$150k-$200k", min: 150000, max: 200000 },
        { label: "$200k+", min: 200000, max: Infinity },
    ];
    const distribution = brackets.map((b) => ({
        label: b.label,
        count: salaries.filter((s) => s >= b.min && s < b.max).length,
    }));

    res.json({
        success: true,
        data: {
            totalWithSalary: jobsWithSalary.length,
            totalWithout: jobs.length - jobsWithSalary.length,
            average,
            median,
            min,
            max,
            byStatus,
            byCompany,
            distribution,
        },
    });
});