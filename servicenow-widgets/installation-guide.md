# ServiceNow Portal Widget Installation Guide

This guide will help you install and configure the Agentic Weaver portal widgets in your ServiceNow instance.

## Prerequisites

- ServiceNow instance with Portal/Service Portal enabled
- System Administrator or equivalent role
- Access to Studio or Update Sets

## Installation Steps

### 1. Create the Widgets

#### Sidebar Widget
1. Navigate to **Service Portal > Widgets**
2. Click **New** to create a new widget
3. Fill in the following details:
   - **Name**: `Agentic Weaver Sidebar`
   - **ID**: `agentic_weaver_sidebar`
   - **Description**: `Navigation sidebar for Agentic Weaver portal`
4. Copy the content from `sidebar-widget/widget.html` into the **HTML Template** field
5. Copy the content from `sidebar-widget/widget.js` into the **Client Script** field
6. Copy the content from `sidebar-widget/widget.scss` into the **CSS - SCSS** field
7. Click **Submit**

#### Main Content Widget
1. Create another new widget with:
   - **Name**: `Agentic Weaver Main Content`
   - **ID**: `agentic_weaver_main_content`
   - **Description**: `Main content area for Agentic Weaver portal`
2. Copy the respective files for HTML, JS, and SCSS
3. Click **Submit**

#### Right Panel Widget
1. Create another new widget with:
   - **Name**: `Agentic Weaver Right Panel`
   - **ID**: `agentic_weaver_right_panel`
   - **Description**: `Right panel with search and branding for Agentic Weaver portal`
2. Copy the respective files for HTML, JS, and SCSS
3. Click **Submit**

### 2. Create the Portal Page

1. Navigate to **Service Portal > Pages**
2. Click **New** to create a new page
3. Fill in the details:
   - **Title**: `Agentic Weaver Portal`
   - **ID**: `agentic_weaver_portal`
   - **Short Description**: `Main portal page for Agentic Weaver`
4. In the **Page specific CSS** field, add:
   ```css
   .portal-container {
       display: flex;
       height: 100vh;
       background-color: #f3f4f6;
   }
   
   .sidebar-container {
       flex-shrink: 0;
   }
   
   .main-container {
       flex-shrink: 0;
   }
   
   .right-container {
       flex: 1;
   }
   ```

### 3. Configure the Page Layout

1. After creating the page, click **Open in Designer**
2. Delete any existing containers/widgets
3. Add a new **Container** with:
   - **Bootstrap class**: `portal-container`
   - **Custom class**: `portal-container`
4. Inside this container, add three **Column** widgets:
   - **Column 1**: Add the `Agentic Weaver Sidebar` widget
   - **Column 2**: Add the `Agentic Weaver Main Content` widget  
   - **Column 3**: Add the `Agentic Weaver Right Panel` widget

### 4. Upload the Logo

1. Navigate to **System Definition > Attachments**
2. Upload the `aw_logo_v1_dark.png` file
3. Make sure it's accessible at `/aw_logo_v1_dark.png` path
4. Alternatively, update the image path in the Right Panel widget HTML

### 5. Configure Portal Settings

1. Navigate to **Service Portal > Portals**
2. Either create a new portal or modify an existing one
3. Set the **Homepage** to your newly created `agentic_weaver_portal` page
4. Configure the portal theme and branding as needed

### 6. Set Up Knowledge Base (Optional)

To make the knowledge articles functional:

1. Navigate to **Knowledge > Articles**
2. Create sample articles matching the titles in the widget:
   - US Leave Policies
   - India Leave Policies
   - BannerTech Laptop Refresh Policy
   - Troubleshooting Printers
   - Global Travel & Expense Policy
   - How to Update Personal Information in Workday

3. Update the Main Content widget's server script to fetch real articles:
   ```javascript
   // Add to server script
   (function() {
       var gr = new GlideRecord('kb_knowledge');
       gr.addActiveQuery();
       gr.query();
       
       var articles = [];
       while (gr.next()) {
           articles.push({
               id: gr.getUniqueValue(),
               title: gr.getDisplayValue('short_description'),
               content: gr.getDisplayValue('text')
           });
       }
       
       data.knowledgeArticles = articles;
   })();
   ```

## Testing

1. Navigate to your portal URL
2. Test the following functionality:
   - Sidebar navigation between sections
   - Collapsing/expanding panels
   - Knowledge article expansion
   - Sample prompts interaction
   - Search input functionality

## Customization

### Styling
- Modify the SCSS files to match your organization's branding
- Update color schemes in the CSS variables
- Adjust responsive breakpoints as needed

### Functionality
- Add real search functionality to the right panel
- Integrate with ServiceNow's Knowledge Management API
- Connect to actual ServiceNow modules for each section
- Add user authentication and role-based access

### Data Integration
- Connect widgets to ServiceNow tables
- Implement real-time data updates
- Add form submissions for requests
- Integrate with ServiceNow workflows

## Troubleshooting

### Common Issues

1. **Widgets not displaying**: Check widget permissions and portal configuration
2. **Styling issues**: Verify SCSS compilation and CSS conflicts
3. **JavaScript errors**: Check browser console and ServiceNow logs
4. **Image not loading**: Verify image upload and path configuration

### Debug Mode
Enable debug mode in ServiceNow to see detailed error messages:
1. Navigate to **Service Portal > Portals**
2. Edit your portal
3. Check **Enable debug mode**

## Support

For additional support:
- Check ServiceNow Community forums
- Review ServiceNow documentation for Service Portal
- Contact your ServiceNow administrator

## Version History

- v1.0: Initial widget implementation
- Compatible with ServiceNow Orlando and later versions