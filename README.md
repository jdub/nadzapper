nadzapper
=========

A web-nasty-blasting url_rewrite_program for Squid, inspired by the venerable [adzapper](http://adzapper.sourceforge.net/). It has recently left the banging-on-it-until-it-works stage, and is entering the tidying-up and resolving-performance-issues stages. :-)

## Details and documentation

For the moment, I have copied the DATA section from the main adzapper Perl script into a separate file, and pointed nadzapper at it. Eventually, nadzapper ought to read multiple matches files, and perhaps do a little special handling in order to read DATA directly out of the adzapper script. Oh, and see the early variable declarations for important configuration items.

- http://wiki.squid-cache.org/Features/Redirectors
- http://wiki.squid-cache.org/ConfigExamples/PhpRedirectors
- http://adzapper.sourceforge.net/scripts/squid_redirect

## Squid url_rewrite_program protocol

	URL ipaddr/hostname ident method keyval=pairs

If url_rewrite_concurrency is enabled, Squid will include an ID at the start of the line. The reply must include that ID. The examples below display IDs in use by Squid on my home proxy... not a lot of concurrency required here, apparently!

	0 http://wiki.squid-cache.org/ConfigExamples/PhpRedirectors 192.168.10.121/sliver - GET myip=192.168.10.200 myport=8080
	0 http://bethesignal.org/wp-admin/admin-ajax.php 192.168.10.121/sliver - POST myip=192.168.10.200 myport=8080
	0 si2.twimg.com:443 192.168.10.121/sliver - CONNECT myip=192.168.10.200 myport=8080
