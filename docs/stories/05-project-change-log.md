# **Project Change Log**

This document covers user stories and acceptance criteria for the project's change log feature, which tracks and displays all modifications to a project and its associated records over time.

---

### **User Story: View Project Change Log**

**Description:**

As Management or an Admin,
I want to navigate to a dedicated change log page for a project and see a timestamped list of all modifications,
So that I can audit changes and maintain full accountability of how the project data evolves over time.

**Acceptance Criteria:**

Feature: 1. Project Change Log

  Background:
    Given I am on the "Project Detail" page for an existing project
    When I click the "View Change Log" link
    Then I should be navigated to the "Change Log" page for that project

  Scenario: 1.1. Change Log Table Sort
    Then I should see a table displaying change log entries
    And the table headers should be "Date/Time", "Changed By", "Category", and "Summary"
    When I click the "Date/Time" column header
    Then the table rows should sort by Timestamp ascending or descending

  Scenario Outline: 1.2. Filter Change Log by Category
    When I click the "<category_name>" tab in the category list
    Then the table should update to display only entries matching that category
    And the pagination control at the bottom should reset to page 1

    Examples:
      | category_name |
      | All           |
      | Project       |
      | Opportunity   |
      | Company       |
      | Activity      |
      | Note          |
      | Equipment     |

  Scenario: 1.3. Expand Change Log Entry Detail Payload
    Given a change log entry row contains field-level JSON detail changes
    And a chevron icon button is visible on the row
    When I click the row
    Then the row should expand to reveal a formatted code block showing the JSON details of what changed
    When I click the row again
    Then the detailed payload section should collapse

  Scenario Outline: 1.4. Paginate Change Log Entries
    Given the project has more than 15 change log entries
    When I select "<rows_per_page>" from the "Rows per page" dropdown
    Then the table should display exactly <rows_per_page> rows
    And the pagination text should read "1–<rows_per_page> of <total>"
    When I click the "Next Page" arrow button
    Then the table should load the next set of entries

    Examples:
       | rows_per_page |
       | 10            |
       | 15            |
       | 25            |
       | 50            |

  Scenario: 1.5. Navigate Away Automatically If Project Not Found
    Given I navigate directly to a change log URL for a non-existent project (e.g., `/project/99999/changelog`)
    Then I should see a "Project Not Found" message
    When I click the "Return to List" button
    Then I should be navigated to the "Project List" page (`/`)
