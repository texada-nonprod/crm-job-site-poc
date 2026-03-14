### **User Story: Manage System Dropdowns**

**Description:**

As a Sales Administrator,
I want to configure the CRM's dropdown values (like Project Status, Subcontractor Roles, and Note Tags),
So that the system matches our unique dealership workflow and reps aren't forced to manually type generic data.

**Acceptance Criteria:**

Feature: 1. Manage Dropdowns

  Background:
    Given I am logged into the CRM
    And I navigate to the "Manage Dropdowns" page

  Scenario Outline: 1.1. View Dropdown Options
    When I click the "<dropdown_name>" button
    Then I should see the "<dropdown_values_table>" table
    And each row should have a "Visible" toggle

    Examples:
      | dropdown_name        | dropdown_values_table        |
      | Project Status       | Project Status Values        |
      | Subcontractor Role   | Subcontractor Role Values    |
      | Note Tags            | Note Tags Values             |
      | Primary Stage        | Primary Stage Values         |
      | Primary Project Type | Primary Project Type Values  |
      | Ownership Type       | Ownership Type Values        |

  Scenario Outline: 1.2. Add New Dropdown Item
    When I click the "<dropdown_name>" button
    And I click the "Add" button
    And I type "<new_label>" into the "Label" input
    And I type "<new_display_order>" into the "Display Order (optional)" input
    And I click the "<new_color>" color button
    And I should see the "Visible" checkbox is checked by default
    And I click the "Add" button inside the form
    Then I should see the success toast message
    And the new item "<new_label>" should appear in the table with a display order of "<new_display_order>", the color "<new_color>", and "Visible" toggled on

    Examples:
      | dropdown_name        | new_label     | new_display_order | new_color |
      | Project Status       | Needs Bid     | 5                 | red       |
      | Note Tags            | Compliance    | 2                 | blue      |

  Scenario Outline: 1.3. Add Item Validation Errors
    When I click the "Project Status" button
    And I click the "Add" button
    And I type "<label_value>" into the "Label" input
    And I click the "Add" button inside the form
    Then I should see the error message "<error_message>"

    Examples:
      | label_value | error_message                          |
      | (leave blank) | Label is required.                     |
      | Active      | An item with this label already exists. |

  Scenario Outline: 1.4. Edit Dropdown Item
    When I click the "<dropdown_name>" button
    And I click the "Edit" button
    And I clear the "Label" input for the "<original_label>" row
    And I type "<new_label>" into the "Label" input for that row
    And I toggle off the "Visible" switch for that row
    And I click the "Save" button
    Then I should see the success toast message
    And the row label should update from "<original_label>" to "<new_label>" and show as not visible

    Examples:
      | dropdown_name        | original_label | new_label       |
      | Project Status       | Active         | Active Project  |
      | Subcontractor Role   | Electrician    | Lead Sparky     |

  Scenario: 1.5. Delete Unused Dropdown Item
    When I click the "Note Tags" button
    And I click the "Delete" trash can button for the "Security" row
    And the system confirms the "Security" tag is not used on any records
    And I should see the "Delete Item" confirmation dialog
    And I click the "Delete" button inside the dialog
    Then I should see the success toast message
    And the item should be removed from the table

  Scenario: 1.6. Prevent Deletion of Used Dropdown Item (Toggle Visibility Instead)
    When I click the "Project Status" button
    And I click the "Delete" trash can button for the "On Hold" row
    And the system detects the "On Hold" status is used by existing project records
    Then I should see an error message "This item is currently in use and cannot be deleted. You can hide it by toggling visibility."
    And the item should remain in the table
    When I uncheck the "Visible" checkbox for the "On Hold" row
    Then I should see the success toast message
    And the "On Hold" item should no longer be available for selection in new records

  Scenario: 1.7. Prevent Deletion and Editing of Protected Roles
    When I click the "Subcontractor Role" button
    Then I should see the "General Contractor" row in the table
    And I should not see a "Delete" trash can button for the "General Contractor" row
    And the "Label" input for the "General Contractor" row should be read-only (disabled)

### **User Story: Map External Dodge Intelligence Data**

**Description:**

As a System Administrator,
I want to map external Dodge Project values to internal lookup lists,
So that incoming automated intel feeds cleanly match our CRM data models and don't flood the system with un-categorized noise.

**Acceptance Criteria:**

Feature: 2. Dodge Project Mappings

  Background:
    Given I am logged into the CRM
    And I navigate to the "Dodge Project Mappings" page

  Scenario: 2.1. Add New Dodge Mapping
    When I click the "Primary Stage" tab
    And I type "Design Phase" into the "Dodge External Value" input
    And I select "Pre-Construction" from the "Maps To" combobox
    And I click the "Add" button
    Then I should see the success toast message
    And the new mapping should appear in the mappings table

  Scenario: 2.2. Add Mapping Validation Error - Missing Fields
    When I click the "Primary Stage" tab
    And I click the "Add" button
    Then I should see the error message "Both fields are required."

  Scenario: 2.3. Add Mapping Validation Error - Duplicate Mapping
    Given there is an existing mapping for "Design Phase" on the "Primary Stage" tab
    When I click the "Primary Stage" tab
    And I type "Design Phase" into the "Dodge External Value" input
    And I select "Bidding" from the "Maps To" combobox
    And I click the "Add" button
    Then I should see the error message "This external value already has a mapping."

  Scenario: 2.4. Edit Mapping Internal Value
    When I click the "Primary Stage" tab
    And I select "Bidding" from the internal mapping dropdown on an existing row
    Then the dropdown value should be updated without needing a save button
    And the new mapping relationship should be saved

  Scenario: 2.5. Delete Dodge Mapping
    When I click the "Primary Stage" tab
    And I click the "Delete" trash can button for an existing mapping row
    Then I should see the success toast message
    And the mapping should be removed from the table
