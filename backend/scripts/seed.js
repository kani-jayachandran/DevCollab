/**
 * DevCollab demo seed script
 * Run: node scripts/seed.js
 *
 * Creates two demo users, one workspace, two projects, tasks, docs and snippets.
 * Safe to re-run — drops existing seed data by email before inserting.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Models ────────────────────────────────────────────────────────────────────
import User      from '../src/models/User.js';
import Workspace from '../src/models/Workspace.js';
import Project   from '../src/models/Project.js';
import Task      from '../src/models/Task.js';
import Doc       from '../src/models/Doc.js';
import Snippet   from '../src/models/Snippet.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devcollab';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // ── Clean up previous seed data ──────────────────────────────────────────
  const seedEmails = ['alice@devcollab.dev', 'bob@devcollab.dev'];
  const oldUsers   = await User.find({ email: { $in: seedEmails } });
  const oldUserIds = oldUsers.map((u) => u._id);

  if (oldUserIds.length) {
    const oldWorkspaces = await Workspace.find({ owner: { $in: oldUserIds } });
    const oldWsIds      = oldWorkspaces.map((w) => w._id);
    const oldProjects   = await Project.find({ workspace: { $in: oldWsIds } });
    const oldProjIds    = oldProjects.map((p) => p._id);

    await Task.deleteMany({ project: { $in: oldProjIds } });
    await Doc.deleteMany({ project: { $in: oldProjIds } });
    await Snippet.deleteMany({ project: { $in: oldProjIds } });
    await Project.deleteMany({ _id: { $in: oldProjIds } });
    await Workspace.deleteMany({ _id: { $in: oldWsIds } });
    await User.deleteMany({ _id: { $in: oldUserIds } });
    console.log('✓ Cleared previous seed data');
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12);

  const alice = await User.create({
    name:     'Alice Chen',
    email:    'alice@devcollab.dev',
    password: passwordHash,
    bio:      'Full-stack engineer · DevCollab demo account',
  });

  const bob = await User.create({
    name:     'Bob Martinez',
    email:    'bob@devcollab.dev',
    password: passwordHash,
    bio:      'Frontend developer · DevCollab demo account',
  });

  console.log('✓ Created users: alice@devcollab.dev, bob@devcollab.dev');

  // ── Workspace ─────────────────────────────────────────────────────────────
  const workspace = await Workspace.create({
    name:        'DevCollab Demo',
    description: 'Demo workspace pre-loaded with sample projects and tasks.',
    owner:       alice._id,
    members: [
      { user: alice._id, role: 'Owner'  },
      { user: bob._id,   role: 'Member' },
    ],
  });

  console.log('✓ Created workspace: DevCollab Demo');

  // ── Projects ──────────────────────────────────────────────────────────────
  const projectA = await Project.create({
    name:        'Website Redesign',
    description: 'Redesign the marketing site with a new design system.',
    workspace:   workspace._id,
    createdBy:   alice._id,
    status:      'active',
    members: [
      { user: alice._id, role: 'Owner'  },
      { user: bob._id,   role: 'Member' },
    ],
  });

  const projectB = await Project.create({
    name:        'API v2',
    description: 'Build the next-generation REST API with improved performance.',
    workspace:   workspace._id,
    createdBy:   alice._id,
    status:      'active',
    members: [
      { user: alice._id, role: 'Owner'  },
      { user: bob._id,   role: 'Member' },
    ],
  });

  console.log('✓ Created projects: Website Redesign, API v2');

  // ── Tasks — Website Redesign ──────────────────────────────────────────────
  await Task.insertMany([
    {
      title:       'Audit current design system',
      description: 'Document all existing components, colours and typography.',
      status:      'Done',
      priority:    'High',
      project:     projectA._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      assignee:    alice._id,
      order:       0,
    },
    {
      title:       'Create new colour palette',
      description: 'Define primary, secondary and neutral tokens in Figma.',
      status:      'Done',
      priority:    'High',
      project:     projectA._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      assignee:    bob._id,
      order:       1,
    },
    {
      title:       'Build reusable Button component',
      description: 'Implement variants: primary, secondary, ghost, danger.',
      status:      'InProgress',
      priority:    'Medium',
      project:     projectA._id,
      workspace:   workspace._id,
      createdBy:   bob._id,
      assignee:    bob._id,
      order:       0,
    },
    {
      title:       'Redesign hero section',
      description: 'New layout with animated headline and CTA.',
      status:      'InReview',
      priority:    'High',
      project:     projectA._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      assignee:    alice._id,
      order:       0,
    },
    {
      title:       'Update navigation bar',
      description: 'Responsive nav with mobile hamburger menu.',
      status:      'Todo',
      priority:    'Medium',
      project:     projectA._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      order:       0,
    },
    {
      title:       'Write copy for About page',
      description: 'Team bios and company mission statement.',
      status:      'Todo',
      priority:    'Low',
      project:     projectA._id,
      workspace:   workspace._id,
      createdBy:   bob._id,
      order:       1,
    },
  ]);

  // ── Tasks — API v2 ────────────────────────────────────────────────────────
  await Task.insertMany([
    {
      title:       'Design OpenAPI 3.0 spec',
      description: 'Document all endpoints with request/response schemas.',
      status:      'Done',
      priority:    'High',
      project:     projectB._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      assignee:    alice._id,
      order:       0,
    },
    {
      title:       'Implement rate limiting middleware',
      description: 'Use sliding window algorithm, 100 req/min per IP.',
      status:      'InProgress',
      priority:    'High',
      project:     projectB._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      assignee:    alice._id,
      order:       0,
    },
    {
      title:       'Add pagination to list endpoints',
      description: 'Cursor-based pagination with limit/after params.',
      status:      'Todo',
      priority:    'Medium',
      project:     projectB._id,
      workspace:   workspace._id,
      createdBy:   bob._id,
      order:       0,
    },
    {
      title:       'Set up Redis caching layer',
      description: 'Cache frequently read resources with 5-minute TTL.',
      status:      'Todo',
      priority:    'Medium',
      project:     projectB._id,
      workspace:   workspace._id,
      createdBy:   alice._id,
      order:       1,
    },
  ]);

  console.log('✓ Created 10 tasks across both projects');

  // ── Docs ──────────────────────────────────────────────────────────────────
  await Doc.create({
    title:        'Design System Guidelines',
    content:      '<h1>Design System Guidelines</h1><p>This document covers the core principles of the DevCollab design system.</p><h2>Colours</h2><p>We use a dark-first palette built on <strong>gray-950</strong> as the base background with <strong>indigo-500</strong> as the primary accent.</p><h2>Typography</h2><p>Body text uses the system font stack at 14px. Headings use <code>font-semibold</code> with tight tracking.</p><h2>Spacing</h2><p>All spacing follows a 4px base grid. Use Tailwind spacing utilities exclusively.</p>',
    project:      projectA._id,
    workspace:    workspace._id,
    createdBy:    alice._id,
    lastEditedBy: alice._id,
    version:      1,
    history: [{
      title:   'Design System Guidelines',
      content: '<h1>Design System Guidelines</h1><p>Initial draft.</p>',
      savedBy: alice._id,
      savedAt: new Date(),
      version: 1,
    }],
  });

  await Doc.create({
    title:        'API v2 Architecture Notes',
    content:      '<h1>API v2 Architecture</h1><p>The v2 API is a RESTful service built on <strong>Express 4</strong> with <strong>MongoDB</strong> as the primary data store.</p><h2>Key Decisions</h2><ul><li>JWT authentication with 7-day expiry</li><li>Nested resource routing (workspaces → projects → tasks)</li><li>Role-based access control at the workspace level</li></ul><h2>Performance Targets</h2><p>P95 response time under 200ms for all list endpoints.</p>',
    project:      projectB._id,
    workspace:    workspace._id,
    createdBy:    alice._id,
    lastEditedBy: alice._id,
    version:      1,
    history: [{
      title:   'API v2 Architecture Notes',
      content: '<h1>API v2 Architecture</h1><p>Initial draft.</p>',
      savedBy: alice._id,
      savedAt: new Date(),
      version: 1,
    }],
  });

  console.log('✓ Created 2 wiki documents');

  // ── Snippets ──────────────────────────────────────────────────────────────
  await Snippet.insertMany([
    {
      title:       'Debounce hook',
      description: 'React hook that debounces a value by a given delay.',
      language:    'javascript',
      code: `import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
      tags:      ['react', 'hooks', 'utility'],
      project:   projectA._id,
      workspace: workspace._id,
      createdBy: bob._id,
    },
    {
      title:       'Paginate MongoDB query',
      description: 'Cursor-based pagination helper for Mongoose.',
      language:    'javascript',
      code: `/**
 * @param {Model}  Model   - Mongoose model
 * @param {object} filter  - query filter
 * @param {number} page    - 1-indexed page number
 * @param {number} limit   - items per page
 */
export async function paginate(Model, filter = {}, page = 1, limit = 20) {
  const skip  = (page - 1) * limit;
  const total = await Model.countDocuments(filter);
  const items = await Model.find(filter).skip(skip).limit(limit).lean();
  return { items, total, page, pages: Math.ceil(total / limit) };
}`,
      tags:      ['mongodb', 'pagination', 'utility'],
      project:   projectB._id,
      workspace: workspace._id,
      createdBy: alice._id,
    },
    {
      title:       'Retry with exponential backoff',
      description: 'Generic async retry utility with configurable attempts and backoff.',
      language:    'python',
      code: `import asyncio
import random

async def retry(fn, max_attempts=3, base_delay=1.0):
    """Retry an async function with exponential backoff + jitter."""
    for attempt in range(max_attempts):
        try:
            return await fn()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
            await asyncio.sleep(delay)`,
      tags:      ['python', 'async', 'utility', 'retry'],
      project:   projectB._id,
      workspace: workspace._id,
      createdBy: alice._id,
    },
  ]);

  console.log('✓ Created 3 code snippets');

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('  Test credentials:');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │  alice@devcollab.dev  /  password123    │  (Owner)');
  console.log('  │  bob@devcollab.dev    /  password123    │  (Member)');
  console.log('  └─────────────────────────────────────────┘\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
