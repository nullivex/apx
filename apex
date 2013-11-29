#!/bin/sh
basedir=`dirname "$0"`

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ -x "$basedir/node" ]; then
  "$basedir/node"  "$basedir/../apex/app/index" "$@"
  ret=$?
else 
  node  "$basedir/../apex/app/index" "$@"
  ret=$?
fi
exit $ret
