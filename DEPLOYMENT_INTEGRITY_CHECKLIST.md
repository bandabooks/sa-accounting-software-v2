# Deployment Integrity Checklist

## Purpose
Prevent accidental regression of working functionality when making fixes or enhancements.

## Pre-Development Protocol

### 1. Working Feature Verification
- [ ] User confirms feature works in deployed/production app
- [ ] Document exactly how the feature works in production
- [ ] Identify specific components/functions involved
- [ ] Record backend logs showing successful operations

### 2. Issue Analysis
- [ ] Distinguish between "completely broken" vs "works but has display issues"
- [ ] Check if backend functionality is working (logs, API responses)
- [ ] Identify if issue is frontend display, data flow, or actual logic failure

### 3. Solution Strategy
- [ ] Prefer minimal changes that preserve working core logic
- [ ] Avoid complete rewrites of functioning systems
- [ ] Test each change incrementally
- [ ] Keep working patterns intact

## During Development

### Code Changes
- [ ] Make smallest possible changes to fix the specific issue
- [ ] Preserve original working architecture and patterns
- [ ] Comment out rather than delete working code initially
- [ ] Test each modification before proceeding

### Validation
- [ ] Verify backend operations still work after changes
- [ ] Confirm frontend displays update correctly
- [ ] Test edge cases that worked in production
- [ ] Check that related features remain functional

## Pre-Deployment Checklist

### Core Functionality Tests
- [ ] All originally working features still function
- [ ] New fixes resolve reported issues
- [ ] No new errors introduced in console/logs
- [ ] Performance hasn't degraded

### Documentation
- [ ] Update replit.md with changes made
- [ ] Record what was preserved from working version
- [ ] Note any architectural decisions for future reference
- [ ] Document rollback procedure if needed

## Emergency Rollback Protocol

If deployment breaks working functionality:
1. Immediately identify which changes caused regression
2. Rollback to last known working state
3. Implement fix with more conservative approach
4. Test thoroughly before redeployment

## Key Principles

1. **Deployed App is Source of Truth**: If user says "this works in production", believe it
2. **Minimal Intervention**: Fix the specific problem without changing working systems
3. **Preserve Working Patterns**: Don't rewrite functioning code for "improvement"
4. **Document Everything**: Record what works and why for future reference
5. **Test Incrementally**: Small changes, frequent verification

## Common Pitfalls to Avoid

- ❌ Rewriting working systems because code "looks messy"
- ❌ Over-engineering solutions to simple display issues
- ❌ Changing cache invalidation when backend already works
- ❌ Adding complexity to "improve" functioning features
- ❌ Assuming broken functionality without checking production logs

## Success Metrics

- ✅ Original functionality preserved
- ✅ Reported issue resolved
- ✅ No new bugs introduced
- ✅ Performance maintained or improved
- ✅ Code changes are minimal and targeted