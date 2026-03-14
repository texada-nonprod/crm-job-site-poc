# **Project Related Pages and Integrations**

This document covers user stories and acceptance criteria for pages and features outside the core Project List and Project Detail views, including the External Reference Search and global filter management based on the current prototype implementation.

---

### **User Story: Project List Filters**

**Description:**

As a Sales Rep,
I want to filter the project list using various criteria,
So that I can focus on projects relevant to my current task.

**Acceptance Criteria:**

Feature: 1. Project List Filters

  Background:
    Given I am on the "Project List" page containing the "Filters" card
    
  Scenario Outline: 1.1. Filter by Multi-Select Options
    When I click the "<filter_label>" multi-select toggle
    And I select "<option>" from the dropdown list
    Then the project table should immediately filter and show only matching projects
    And a badge reading "<badge_prefix>: <option>" should appear below the filter bar

    Examples:
      | filter_label | option      | badge_prefix |
      | Assignees    | Smith, John | Assignee     |
      | Divisions    | C - Compact | Division     |
      | Statuses     | Active      | Status       |

  Scenario: 1.2. Filter by General Contractor
    When I type "Turner" into the "General Contractor" input (#gc)
    Then the project table should immediately filter to matching records
    And a badge reading "GC: Turner" should appear below the filter bar

  Scenario: 1.3. Hide Completed Projects
    When I click the "Hide Completed" switch (#hideCompleted)
    Then the project table should immediately filter out completed projects
    And a badge reading "Hide Completed" should appear below the filter bar

  Scenario: 1.4. Remove Active Filters via Badges
    Given an active filter badge is displayed below the filter bar
    When I click the "X" button on the badge
    Then the filter should be removed
    And the project table should immediately update to reflect the removed filter

---

### **User Story: External Reference Search**

**Description:**

As a Sales Rep,
I want to search for and link external references (like Dodge Data) to a project during creation,
So that I can easily associate external data source URLs to the CRM project.

**Acceptance Criteria:**

Feature: 2. External Reference Search

  Background:
    Given I am on the "Create New Project" modal form

  Scenario: 2.1. Search and Select External Reference
    When I type "St. Marys" into the "Search for external project..." input
    Then a dropdown list of matching external projects should appear
    And I should see the source label (e.g., "Dodge Data & Analytics") for the matches
    When I click on a result in the dropdown
    Then the search input should be replaced by a selected project card
    And the card should show the project name, source badge, and an external link

  Scenario: 2.2. Remove Selected Reference
    Given an external reference has been selected and the card is visible
    When I click the "Remove" button on the selected reference card
    Then the card should disappear
    And the "Search for external project..." input should reappear
