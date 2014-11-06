BTVideoBlacklistSrv
===================

An anonymous collection server to get metrics for the video blacklist plugin.

The basic idea is, the client will come up with a random ID, 36
character alphanumeric, which is unrelated to any other user
information. This is the metrics ID for all their transactions.
We track ID, and number of dumps for each ID, along with the dump
contents. If someone's setup prevents the ID from persisting in
localStorage then we'll get filled up with single-time dumps from some ID's.
Those can ignored/removed.

Before any dumps are accepted the client must submit a metrics
ID. this should be a 36-character alphanumeric lower-case string.

```javascript
{
  mid:"0123456789abcdefghijklmnopqrstuvwxyz"
}
```

Dumps will be rate-limited, and should include:

```javascript
{
	dump: {
		blacklistVids: [... Array of {videotype,videoid} ...]
	}
}
```

This allows for future metrics to be collected without breaking
the model / protocol.

The dumps get saved to disk via NeDB.
