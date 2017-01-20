// Gmail Manager
// By Todd Long <longfocus@gmail.com>
// http://www.longfocus.com/firefox/gmanager/

var gmanager_Migrate = new function()
{
  this.__proto__ = new gmanager_BundlePrefix("gmanager-migrate-");
  
  this.load = function()
  {
    var logins = null;
    
    // Unwrap the window arguments; if available
    if (window.arguments)
    {
      // window.arguments[0] : logins
      
      logins = window.arguments[0];
    }
    
    var accountsList = document.getElementById("gmanager-migrate-accounts");
    
    if (logins && logins.length > 0)
    {
      logins.forEach(function(login, index, array) {
        var accountItem = document.createElement("listitem");
        accountItem.setAttribute("class", "gmanager-migrate-listitem");
        accountItem.setAttribute("email", login.username);
        accountItem.setAttribute("password", login.password);
        accountsList.appendChild(accountItem);
      });
    }
    else
    {
      // Disable the accounts listbox (looks better)
      accountsList.disabled = true;
      
      // Display message that there are no accounts
      var accountItem = document.createElement("listitem");
      accountItem.setAttribute("label", this.getString("no-accounts"));
      accountsList.appendChild(accountItem);
      
      // Disable the login checkbox
      document.getElementById("gmanager-migrate-login").disabled = true;
      
      // Disable the passwords button
      document.getElementById("gmanager-migrate-passwords").disabled = true;
    }
    
    // Toggle the passwords (initially hidden)
    this.togglePasswords();
  }
  
  this.togglePasswords = function()
  {
    var isHidden = document.getElementById("gmanager-migrate-accounts-password").collapsed;
    document.getElementById("gmanager-migrate-passwords").label = (isHidden ? this.getString("hide-passwords") : this.getString("show-passwords"));
    document.getElementById("gmanager-migrate-accounts-password").collapsed = !isHidden
  }
  
  this.dialogAccept = function()
  {
    var manager = Components.classes["@longfocus.com/gmanager/manager;1"].getService(Components.interfaces.gmIManager);
    var accountsList = document.getElementsByTagName("listitem");
    
    for (var i = 0, n = accountsList.length; i < n; i++)
    {
      var accountItem = accountsList[i];
      
      // Check if the account should be "migrated" (i.e. added)
      if (accountItem.checked && !manager.isAccount(accountItem.email))
      {
        // Add the account
        var account = manager.addAccount("gmail", accountItem.email, accountItem.email, accountItem.password, null);
        
        // Check if the account should login
        if (document.getElementById("gmanager-migrate-login").checked)
        {
          // Login to the account
          account.login(null);
        }
      }
    }
    
    // Save the accounts
    manager.save();
    
    // Notify the observers that preferences have changed
    var observer = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observer.notifyObservers(null, gmanager_Prefs.NOTIFY_CHANGED, null);
    
    // Close the dialog
    return true;
  }
}