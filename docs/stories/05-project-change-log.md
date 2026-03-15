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

---

### **User Story: Automatic Change Log Generation**

**Description:**

As Management or an Admin,
I want the system to automatically generate timestamped change log entries whenever project data is modified,
So that I don't have to rely on users manually tracking their changes, ensuring a reliable audit trail.

**Acceptance Criteria:**

Feature: 2. Automatic Change Log Generation

  Background:
    Given I am authenticated in the CRM system
    And I have an existing project open

  Scenario Outline: 2.1. Generate Logs for Entity Association and Disassociation
    When I perform the "<action>" action for a "<entity_type>" on the project
    Then the system should automatically generate a change log entry
    And the entry "Category" should be "<category>"
    And the entry "Summary" should read "<expected_summary_format>"

    Examples:
      | action                  | entity_type | category    | expected_summary_format                                |
      | Associate Opportunity   | Opportunity | Opportunity | Opportunity "[description]" associated                 |
      | Add Company             | Company     | Company     | Company "[name]" added as [role]                       |
      | Remove Company          | Company     | Company     | Company "[name]" disassociated                         |
      | Add Customer Equipment  | Equipment   | Equipment   | Equipment "[make] [model]" added                       |
      | Remove Customer Equip.  | Equipment   | Equipment   | Equipment "[make] [model]" removed                     |

  Scenario Outline: 2.2. Generate Logs for Entity Creation and Deletion
    When I completely fill out and submit the "<modal_name>"
    Then the system should automatically generate a change log entry
    And the entry "Category" should be "<category>"
    And the entry "Summary" should read "<expected_summary_format>"

    Examples:
      | modal_name               | category    | expected_summary_format                                |
      | Create New Project       | Project     | Project "[name]" created                               |
      | Create Opportunity       | Opportunity | Opportunity "[description]" created                    |
      | Add Activity             | Activity    | Activity "[type]" added                                |
      | Delete Activity          | Activity    | Activity "[description]" deleted                       |
      | Add Note                 | Note        | Note added                                             |
      | Delete Note              | Note        | Note deleted                                           |

  Scenario Outline: 2.3. Generate Logs for Entity Updates
    When I update an existing "<entity_type>" record and save the changes
    Then the system should automatically generate a change log entry
    And the entry "Category" should be "<category>"
    And the entry "Summary" should read "<expected_summary_format>"
    And the JSON details payload should capture the specific fields that were changed

    Examples:
      | entity_type | category    | expected_summary_format                                  |
      | Project     | Project     | Project details updated ([changed_fields])               |
      | Opportunity | Opportunity | Opportunity "[description]" updated ([changed_fields])   |
      | Company     | Company     | Company "[name]" updated                                 |
      | Activity    | Activity    | Activity updated                                         |
      | Note        | Note        | Note updated                                             |

---

### **User Story: View Note Edit History**

**Description:**

As a Sales Rep or Admin,
I want to view the edit history of an individual note,
So that I can see the original context and how the note has evolved over time.

**Acceptance Criteria:**

Feature: 3. Note Edit History

  Scenario: 3.1. View Note Edit History Inline
    Given a note has a modification history
    When I view the note in the "Notes" section of the Project Detail page 
    Then I should see a "View history" link containing the number of edits (e.g., "(1 edit)")
    When I click the "View history" Collapsible trigger
    Then the history should expand to show the latest 3 edits
    And each entry should display the timestamp, the author's name, a summary of changes, and the previous content in italics
    
  Scenario: 3.2. Show All Edits Inline
    Given a note has more than 3 edits in its history
    And I have clicked "View history" to expand the latest 3 edits
    When I click the "Show all X edits" button
    Then the block should expand into a scrollable area displaying all past edits
    And the button text should change to "Show less"
    When I click the "Show less" button
    Then the block should collapse back to showing only the top 3 edits

  Scenario: 3.3. View Edit History Inside Note Modal
    Given a note has a modification history
    When I click the "Edit" button for that note
    Then I should see an "Edit History" block at the top of the "Edit Note" modal
    And it should display the latest 3 edits with the timestamp, author, and previous content
    When I click "Show all X edits"
    Then the area should become scrollable and display all historical edits
