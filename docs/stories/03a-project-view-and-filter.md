### **User Story: View Core Project Information**

**Description:**

As an Outside Sales Rep,
I want to view the core details of a project (location, owner, assignees, description, and high-level revenue),
So that I can quickly understand the scope of the project before a site visit.

**Acceptance Criteria:**

Feature: 1. Core Project Detail View

  Background:
    Given I am logged into the CRM
    And I am on the "Projects List" page
    And I click on a project row in the table
    Then I should be navigated to the "Project Detail" page

  Scenario: 1.1. View Base Information
    Then I should see the project name header
    And I should see the current status in the status dropdown
    And I should see the project ID
    And I should see the "Location" card with the address
    And I should see the "Project Owner" card with the company name and primary contacts
    And I should see the "Assignees" card with the assigned users
    And I should see the "Description" card
    And I should see the "Revenue" section displaying "Pipeline Revenue" and "Won Revenue"

  Scenario: 1.2. Toggle Location View
    Given the project has both an address and coordinates
    When I click the "Coordinates" button in the Location card
    Then I should see the latitude and longitude displayed
    When I click the "Address" button
    Then I should see the street address, city, state, and zip code displayed

  Scenario: 1.3. Show More / Less Text
    Given the project has a description longer than 120 characters
    Then the description text should be truncated
    When I click the "Show more" link
    Then the full description text should be visible
    When I click the "Show less" link
    Then the description text should be truncated again

  Scenario Outline: 1.4. External Reference Links
    Given the project has an external reference link to "<source>"
    Then I should see the "<source>" name
    When I click the external link symbol
    Then a new browser tab should open to the external URL

    Examples:
      | source     |
      | Dodge      |
      | IIR PEC    |
      | ICN Gateway|

### **User Story: View and Filter Opportunities**

**Description:**

As an Inside Sales Rep,
I want to view, sort, and filter the list of opportunities associated with a project,
So that I can track active bids and pipeline revenue tied specifically to this jobsite.

**Acceptance Criteria:**

Feature: 2. Project Opportunities View

  Background:
    Given I am on the "Project Detail" page

  Scenario: 2.1. Default Table State
    Then I should see the "Leads & Opportunities" table
    And the table should display opportunities sorted by Stage in ascending order by default
    And the "Show Open Only" switch (#oppShowOpenOnly) should be enabled by default

  Scenario Outline: 2.2. Sort Opportunities Table
    When I click on the "<column_name>" table header
    Then the table should sort by "<sort_type>" in ascending order
    When I click on the "<column_name>" table header again
    Then the table should sort by "<sort_type>" in descending order

    Examples:
      | column_name | sort_type |
      | Type        | type      |
      | Stage       | stage     |
      | Est. Close  | date      |
      | Est. Revenue| currency  |

  Scenario Outline: 2.3. Filter Opportunities by Attributes
    When I click the "<filter_name>" multi-select filter
    And I select "<filter_value>"
    Then the table should only display opportunities matching the selected "<filter_value>"

    Examples:
      | filter_name | filter_value |
      | Stages      | Bidding      |
      | Divisions   | Power        |
      | Types       | Generator    |
      | Sales Reps  | John Doe     |
      | Companies   | Acme Corp    |

  Scenario: 2.4. Toggle "Show Open Only"
    Given the "Show Open Only" switch (#oppShowOpenOnly) is enabled
    When I click the "Show Open Only" switch to disable it
    Then the table should update to include opportunities in closed/lost stages

### **User Story: View and Filter Companies**

**Description:**

As an Outside Sales Rep,
I want to see all companies associated with a project,
So that I know which subcontractors and general contractors are working on site.

**Acceptance Criteria:**

Feature: 3. Project Companies View

  Background:
    Given I am on the "Project Detail" page

  Scenario: 3.1. Default Company List
    Then I should see the "Companies" section
    And I should see a table listing all associated companies (excluding the primary Project Owner)
    And I should see the role badges for each company (e.g., General Contractor, Electrician)

  Scenario: 3.2. Toggle Customer Number
    When I click the "Customer #" switch (#show-customer-number)
    Then the table should update to display the internal ERP customer number next to the company names

### **User Story: View and Filter Activities**

**Description:**

As a Sales Manager,
I want to view, sort, and extensively filter the stream of activities on a project,
So that I can monitor rep follow-ups, outstanding tasks, and overall engagement with the site.

**Acceptance Criteria:**

Feature: 4. Project Activities View

  Background:
    Given I am on the "Project Detail" page

  Scenario: 4.1. Default Activity Table
    Then I should see the "Activities" table
    And the table should display activities sorted by Date in descending order by default

  Scenario: 4.2. Apply Complex Filters
    When I click the "Filters" button with the filter icon
    And the "Activity Filter" modal opens
    And I select "Face-to-Face" from the "Activity Type" multi-select
    And I select "Outstanding" from the "Status" multi-select
    And I click the "Apply Filters" button
    Then the modal should close
    And the table should only display outstanding face-to-face activities
    And I should see filter badges indicating the active filters above the table

  Scenario: 4.3. Change Column Visibility
    When I click the "Columns" selector button
    And I uncheck the "Assignee" option
    Then the "Assignee" column should disappear from the Activities table
    When I check the "Assignee" option
    Then the "Assignee" column should reappear

### **User Story: View and Search Customer Equipment**

**Description:**

As a Product Support Rep,
I want to view and search the equipment machines deployed to a project,
So that I can identify machines needing service or tracking.

**Acceptance Criteria:**

Feature: 5. Project Equipment View

  Background:
    Given I am on the "Project Detail" page

  Scenario: 5.1. View Grouped Equipment
    Then I should see the "Customer Equipment" section
    And the equipment should be grouped into collapsible sections by the Company that owns/rents them
    And the collapsible sections should be expanded by default

  Scenario: 5.2. Search Equipment
    When I type "Excavator" into the "Search equipment..." input
    Then the list should instantly filter to show only equipment rows where the Type, Make, or Model contains "Excavator"
    And empty company groups should be hidden

  Scenario: 5.3. Toggle Unit of Measure (UOM)
    When I click the "Show UOM" switch (#show-uom)
    Then a new "UOM" column should appear in the equipment tables
    And the state of this switch should be saved locally for my next session
